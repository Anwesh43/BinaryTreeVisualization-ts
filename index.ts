const w : number = window.innerWidth, h : number = window.innerHeight
const maxNodes : number = 20
const hgap : number = h / (maxNodes)
const wgap : number = (w / 2) / (maxNodes)
const r : number = Math.min(wgap, hgap) / 5
const scGap : number = 0.1
var data = 0

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
        context.beginPath()
        context.arc(this.x, this.y, r, 0, 2 * Math.PI)
        context.fill()
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
}
