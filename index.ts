const w : number = window.innerWidth, h : number = window.innerHeight
const maxNodes : number = 20
const hgap : number = h / (maxNodes)
const wgap : number = (w / 2) / (maxNodes)
const r : number = Math.min(wgap, hgap) / 5
var data = 0

class BinaryTreeNode {

    left : BinaryTreeNode = null
    right : BinaryTreeNode = null
    x : number
    y : number
    ox : number
    oy : number

    constructor(private data : number) {

    }

    setPositions(ox : number, oy : number, x : number, y : number) {
        this.ox = ox
        this.oy = oy
        this.x = x
        this.y = y
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
}
