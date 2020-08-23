const w : number = window.innerWidth 
const h : number = window.innerHeight
const parts : number = 4 
const delay : number = 20 
const scGap : number = 0.02 / parts 
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