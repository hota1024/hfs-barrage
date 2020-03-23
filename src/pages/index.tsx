import Head from 'next/head'
import { useRef, useEffect } from 'react'
import {
  TinyGame,
  CanvasRenderer,
  CanvasInputManager,
  AnimationFrameRequestTicker,
  Point2D,
  KeyCode,
} from 'tiny-canvas'

const Distance = (p0: Point2D, p1: Point2D) => {
  // a^2 = b^2 + c^2
  const x = (p0.x - p1.x) ** 2
  const y = (p0.y - p1.y) ** 2
  return Math.sqrt(x + y)
}

class Bullet {
  maxSpeed = 0

  constructor(
    private game: BarrageGame,
    public point: Point2D,
    public angle: number,
    public speed: number,
    public color: string
  ) {
    this.maxSpeed = speed * 2
  }

  update() {
    this.point.x += Math.cos(this.angle) * this.maxSpeed
    this.point.y += Math.sin(this.angle) * this.maxSpeed

    if (Distance(this.point, this.game.player.point) <= 10) {
      alert('Game Over')
    }

    this.maxSpeed += (this.speed - this.maxSpeed) / 10
  }

  draw() {
    this.game.fillCircle(this.point, 8, this.color)
    this.game.fillCircle(this.point, 6, 'white')
  }
}

class Player {
  constructor(private game: BarrageGame, public point: Point2D) {}

  update() {
    const velocity = {
      x: 0,
      y: 0,
    }
    const speed = this.game.keyPressed(KeyCode.ShiftLeft) ? 1 : 4

    if (this.game.keyPressed(KeyCode.ArrowUp)) {
      --velocity.y
    }
    if (this.game.keyPressed(KeyCode.ArrowDown)) {
      ++velocity.y
    }
    if (this.game.keyPressed(KeyCode.ArrowLeft)) {
      --velocity.x
    }
    if (this.game.keyPressed(KeyCode.ArrowRight)) {
      ++velocity.x
    }

    if (Math.abs(velocity.x) > 0 && Math.abs(velocity.y) > 0) {
      velocity.x /= Math.sqrt(2)
      velocity.y /= Math.sqrt(2)
    }

    this.point.x += velocity.x * speed
    this.point.y += velocity.y * speed
  }

  draw() {
    this.game.fillCircle(this.point, 10, '#00aaff')
  }
}

class BarrageGame extends TinyGame {
  player: Player

  bullets: Bullet[] = []

  colors = ['red', 'blue', 'green']

  colorIndex = 0

  constructor(canvas: HTMLCanvasElement) {
    super(
      new CanvasRenderer(canvas),
      new CanvasInputManager(canvas),
      new AnimationFrameRequestTicker()
    )

    this.player = new Player(this, {
      x: 320,
      y: 400,
    })
  }

  allAngleShot(offsetAngle: number, count: number, color: string) {
    const span = 360 / count
    let angle = offsetAngle

    for (let i = 0; i < count; ++i) {
      this.bullets.push(new Bullet(this, this.center, angle, 2, color))
      angle += (span * Math.PI) / 180
    }
  }

  onFrame() {
    this.bullets.forEach((bullet) => bullet.update())
    this.player.update()

    if (this.ticker.currentFrames() % 40 === 0) {
      const angle = Math.atan2(
        this.player.point.y - this.center.y,
        this.player.point.x - this.center.x
      )
      this.allAngleShot(angle, 36, this.colors[this.colorIndex])

      ++this.colorIndex
      this.colorIndex %= this.colors.length
    }

    this.fillRect(0, 0, 640, 480, 'black')

    this.bullets.forEach((bullet) => bullet.draw())
    this.player.draw()
  }
}

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement>()

  useEffect(() => {
    const game = new BarrageGame(canvasRef.current)
    game.start()
  })

  return (
    <div className="container">
      <Head>
        <title>シューティングゲーム</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <canvas ref={canvasRef} width="640" height="480"></canvas>

      <style global jsx>{`
        html,
        body {
          padding: 0;
          margin: 0;
        }

        .container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #202020;
        }

        canvas {
          background: white;
        }
      `}</style>
    </div>
  )
}

export default Home
