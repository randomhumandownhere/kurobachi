import "./Pet.css";
import { useState, useEffect, useRef } from "react";

const images: Record<string, { default: string }> = import.meta.glob("./assets/monarch-butterfly/*/*.png", { eager: true });

function Pet() {
    const koiRef = useRef<HTMLDivElement>(null);

    type Position = {
        x: number;
        y: number;
    };

    const homePosition = { x: screen.width - 100, y: screen.height - 120 };

    const [position, setPosition] = useState<Position>(homePosition);
    const [petState, setPetState] = useState<string>("fly");
    const [isWalking, setIsWalking] = useState<boolean>(false);
    const [flyUp, setFlyUp] = useState<boolean>(true);
    const [frame, setFrame] = useState<number>(1);

    const incrementNumber = () => setFrame((prev) => (prev + 1) % 5);
    const [direction, setDirection] = useState<string>("left");

    useEffect(() => {
        const interval = setInterval(incrementNumber, 50);
        const allin = setInterval(gamble, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(allin);
        };
    }, []);

    useEffect(() => {
        const animate = setInterval(() => {
            flyPetAnim();
            walk();
        }, 10);

        return () => {
            clearInterval(animate);
        };
    }, [position, flyUp]);

    const gamble = () => {
        if (position.x < 200) {
            setIsWalking(true);
            setDirection("right");
            return;
        }

        if (position.x > screen.width - 200) {
            setIsWalking(true);
            setDirection("left");
            return;
        }

        if (Math.random() < 0.3) {
            setIsWalking(true);
            setDirection(Math.random() < 0.5 ? "left" : "right");
        } else {
            setIsWalking(false);
        }
    };

    const walk = () => {
        setPosition(prev => {
            let newX = prev.x;
            if (isWalking) {
                if (direction === "left") {
                    newX = prev.x - 5;
                } else {
                    newX = prev.x + 5;
                }
            }

            if (newX < 0) {
                newX = 0;
                setIsWalking(false);
            }
            if (newX > screen.width - 175) {
                newX = screen.width - 175;
                setIsWalking(false);
            }

            return { ...prev, x: newX };
        });
    };

    const flyPetAnim = () => {
        if (position.y >= screen.height - 120 && flyUp === false) {
            setFlyUp(true);
        } else if (position.y <= screen.height - 280 && flyUp === true) {
            setFlyUp(false);
        }

        if (flyUp) {
            setPosition(prev => ({ ...prev, y: prev.y - 1 }));
        } else {
            setPosition(prev => ({ ...prev, y: prev.y + 1 }));
        }
    };

    const calculateStyle = (pos: Position): React.CSSProperties => {
        return {
            position: 'absolute',
            left: `${pos.x - 90}px`,
            top: `${pos.y - 75}px`,
            animationTimingFunction: 'ease-in-out',
            transition: 'top 1.5s, left 1.5s, transform 0.5s',
            transform: `scaleX(${direction === "left" ? 1 : -1})`
        };
    };

    const key = `./assets/monarch-butterfly/${petState}/${petState}-${frame.toString()}.png`;
    const imageModule = images[key];

    return (
        <div className="container">
            <div style={calculateStyle(position)} ref={koiRef}>
                <img
                    className="pet"
                    width={175}
                    src={imageModule ? imageModule.default : ""}
                    alt="pet"
                />
            </div>
        </div>
    );
}

export default Pet;