const w : number = window.innerWidth, h : number = window.innerHeight
const maxNodes : number = 20
const hgap : number = h / (maxNodes)
const wgap : number = (w / 2) / (maxNodes)
const r : number = Math.min(wgap, hgap) / 5
const scGap : number = 0.1
var data = 0

const insideCircle = (x : number, y : number, cx: number, cy : number, r : number) => {
    return x >= cx - r && x <= cx + r && y >= cy - r && y <= cy + r
}

class DrawingUtil {

    static drawFillCircle(context : CanvasRenderingContext2D, x : number, y : number, r : number) {
        context.beginPath()
        context.arc(x, y, r, 0, 2 * Math.PI)
        context.fill()
    }

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }
}

class Animator {

    nodes : Array<BinaryTreeNode> = []
    interval : number

    add(node : BinaryTreeNode) {
        this.nodes.push(node)
        if (this.nodes.length == 1) {
            this.start()
        }
    }

    start() {
        this.interval = setInterval(() => {
            this.nodes.forEach((node, i) => {
                node.update(() => {
                    this.nodes.splice(i, 1)
                    if (this.nodes.length == 0) {
                        clearInterval(this.interval)
                    }
                })
            })
        })
    }
}

const animator = new Animator()

class State {

    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += scGap * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class BinaryTreeNode {

    left : BinaryTreeNode = null
    right : BinaryTreeNode = null
    x : number
    y : number
    ox : number
    oy : number
    dx : number
    dy : number
    state : State = new State()

    constructor(private data : number) {

    }

    setPositions(ox : number, oy : number, x : number, y : number) {
        this.ox = ox
        this.oy = oy
        this.x = ox
        this.y = oy
        this.dx = x
        this.dy = y
    }

    addLeftNode() {
        if (this.left == null) {
            this.left = new BinaryTreeNode(data++)
            this.left.setPositions(this.x, this.y, this.x - wgap, this.y + hgap)
        }
    }

    addRightNode() {
        if (this.right == null) {
            this.right = new BinaryTreeNode(data++)
            this.right.setPositions(this.x, this.y, this.x + wgap, this.y + hgap)
        }
    }

    drawNode(context : CanvasRenderingContext2D) {
        DrawingUtil.drawFillCircle(context, this.x, this.y, r)
        if (this.left) {
            DrawingUtil.drawLine(context, this.x, this.y, this.left.x, this.left.y)
            this.left.drawNode(context)
        }
        if (this.right) {
            DrawingUtil.drawLine(context, this.x, this.y, this.right.x, this.right.y)
            this.right.drawNode(context)
        }
    }

    start() {
        this.state.startUpdating(() => {
            animator.add(this)
        })
    }

    update(cb : Function) {
        this.x = this.ox + (this.dx - this.ox) * this.state.scale
        this.y = this.oy + (this.dy - this.oy) * this.state.scale
        this.state.update(cb)
    }

    handleTap(x : number, y : number) : BinaryTreeNode {
        if (this.state.dir != 0) {
            return null
        }
        if (this.left != null && this.right != null) {
            if (insideCircle(x, y, this.x, this.y, r)) {
                return null
            } else {
                const nodeLeft = this.left.handleTap(x, y)
                if (nodeLeft != null) {
                    return nodeLeft
                }
                const rightNode = this.right.handleTap(x, y)
                if (rightNode != null) {
                    return rightNode
                }
                return null
            }
        }
        if (insideCircle(x, y, this.x, this.y, r)) {
            return this
        }
    }

    isPointingToLeft(x : number) {
        return x <= this.x && this.left == null
    }

    isPointingToRight(x : number) {
        return x >= this.x && this.right == null
    }
}

class TouchHandler {

    curr : BinaryTreeNode = null

    handleTap(x : number, y : number, cb : Function, startcb : Function) {
        if (this.curr == null) {
            this.curr = cb(this)
        } else {
            var newNode : BinaryTreeNode = null
            if (this.curr.isPointingToLeft(x)) {
                this.curr.addLeftNode()
                newNode = this.curr.left
            } else if (this.curr.isPointingToRight(x)) {
                this.curr.addRightNode()
                newNode = this.curr.right
            }
            startcb(newNode)
        }
    }
}
