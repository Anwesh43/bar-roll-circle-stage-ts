
const w : number = window.innerWidth 
const h : number = window.innerHeight
const parts : number = 4 
const delay : number = 20 
const scGap : number = 0.02 / parts 
const sizeFactor : number = 10
const strokeFactor : number = 90
const backColor : string = "#bdbdbd"
const colors : Array<string> = ["#F44336", "#4CAF50", "#2196F3", "#FF5722", "#009688"] 

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n 
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
 }

 class DrawingUtil {
    

    static drawCircle(context : CanvasRenderingContext2D, x : number, y : number, r : number) {
        context.beginPath()
        context.arc(x, y, r, 0, 2 * Math.PI)
        context.fill()
    }

    static drawBallRollCircle(context : CanvasRenderingContext2D, scale : number) {
        const sf : number = ScaleUtil.sinify(scale)
        const sf1 : number = ScaleUtil.divideScale(sf, 0, parts)
        const sf2 : number = ScaleUtil.divideScale(sf, 1, parts)
        const sf3 : number = ScaleUtil.divideScale(sf, 2, parts)
        const sf4 : number = ScaleUtil.divideScale(sf, 3, parts)
        const y : number = h - h * 0.5 * sf2 
        const size : number = w / sizeFactor  
        DrawingUtil.drawCircle(context, size / 2 + (w - size) * sf4, y - size / 2, size * 0.5 * sf1)
        context.fillRect(0, y, size, h * 0.5 * sf2)
        context.fillRect(size, h - h * 0.5 * sf3, (w - size), h * 0.5 * sf3)
    }

    static drawBRCNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.fillStyle = colors[i]
        DrawingUtil.drawBallRollCircle(context, scale)
    }
 }

 class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    renderer : Renderer = new Renderer()
    
    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
 }
 
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

 class Animator {

    animated : Boolean = false 
    interval : number 

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true 
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false 
            clearInterval(this.interval)
        }
    }
 }

 class BRCNode {

    state : State = new State()
    prev : BRCNode 
    next : BRCNode 

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new BRCNode(this.i + 1)
            this.next.prev = this 
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawBRCNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : BRCNode {
        var curr : BRCNode = this.prev  
        if (dir == 1) {
            curr = this.next 
        }
        if (curr) {
            return curr 
        }
        cb()
        return this 
    }
 }

 class BarRollCircle {

    curr : BRCNode = new BRCNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }
    
    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
 }

 class Renderer {

    animator : Animator = new Animator()
    brc : BarRollCircle = new BarRollCircle()

    render(context : CanvasRenderingContext2D) {
        this.brc.draw(context)
    }

    handleTap(cb : Function) {
        this.brc.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.brc.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
 }