"use client"
import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export const BackgroundBeams = React.memo(
    ({ className }: { className?: string }) => {
        // Keep only center/near-screen beams
        const paths = [
            "M-324 -253C-324 -253 -256 152 208 279C672 406 740 811 740 811",
            "M-317 -261C-317 -261 -249 144 215 271C679 398 747 803 747 803",
            "M-310 -269C-310 -269 -242 136 222 263C686 390 754 795 754 795",
            "M-303 -277C-303 -277 -235 128 229 255C693 382 761 787 761 787",
            "M-296 -285C-296 -285 -228 120 236 247C700 374 768 779 768 779",
            "M-289 -293C-289 -293 -221 112 243 239C707 366 775 771 775 771",
            "M-282 -301C-282 -301 -214 104 250 231C714 358 782 763 782 763",
            "M-275 -309C-275 -309 -207 96 257 223C721 350 789 755 789 755",
            "M-268 -317C-268 -317 -200 88 264 215C728 342 796 747 796 747",
            "M-261 -325C-261 -325 -193 80 271 207C735 334 803 739 803 739",
            "M-254 -333C-254 -333 -186 72 278 199C742 326 810 731 810 731",
            "M-247 -341C-247 -341 -179 64 285 191C749 318 817 723 817 723",
            "M-240 -349C-240 -349 -172 56 292 183C756 310 824 715 824 715",
        ]
        return (
            <div
                className={cn(
                    "absolute  h-full w-full inset-0  [mask-size:40px] [mask-repeat:no-repeat] flex items-center justify-center",
                    className,
                )}
            >
                <svg
                    className=" z-0 h-full w-full pointer-events-none absolute "
                    width="100%"
                    height="100%"
                    viewBox="0 0 696 316"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M-324 -253C-324 -253 -256 152 208 279C672 406 740 811 740 811M-317 -261C-317 -261 -249 144 215 271C679 398 747 803 747 803M-310 -269C-310 -269 -242 136 222 263C686 390 754 795 754 795M-303 -277C-303 -277 -235 128 229 255C693 382 761 787 761 787M-296 -285C-296 -285 -228 120 236 247C700 374 768 779 768 779M-289 -293C-289 -293 -221 112 243 239C707 366 775 771 775 771M-282 -301C-282 -301 -214 104 250 231C714 358 782 763 782 763M-275 -309C-275 -309 -207 96 257 223C721 350 789 755 789 755M-268 -317C-268 -317 -200 88 264 215C728 342 796 747 796 747M-261 -325C-261 -325 -193 80 271 207C735 334 803 739 803 739M-254 -333C-254 -333 -186 72 278 199C742 326 810 731 810 731M-247 -341C-247 -341 -179 64 285 191C749 318 817 723 817 723M-240 -349C-240 -349 -172 56 292 183C756 310 824 715 824 715"
                        stroke="url(#paint0_radial_242_278)"
                        strokeOpacity="0.05"
                        strokeWidth="0.5"
                    ></path>

                    {paths.map((path, index) => (
                        <motion.path
                            key={`path-` + index}
                            d={path}
                            stroke={`url(#linearGradient-${index})`}
                            strokeOpacity="0.4"
                            strokeWidth="0.5"
                        ></motion.path>
                    ))}
                    <defs>
                        {paths.map((path, index) => (
                            <motion.linearGradient
                                id={`linearGradient-${index}`}
                                key={`gradient-${index}`}
                                initial={{
                                    x1: "0%",
                                    x2: "0%",
                                    y1: "0%",
                                    y2: "0%",
                                }}
                                animate={{
                                    x1: ["0%", "100%"],
                                    x2: ["0%", "95%"],
                                    y1: ["0%", "100%"],
                                    y2: ["0%", `${93 + Math.random() * 8}%`],
                                }}
                                transition={{
                                    duration: Math.random() * 10 + 10,
                                    ease: "easeInOut",
                                    repeat: Infinity,
                                    delay: Math.random() * 10,
                                }}
                            >
                                <stop stopColor="#18CCFC" stopOpacity="0"></stop>
                                <stop stopColor="#18CCFC"></stop>
                                <stop offset="32.5%" stopColor="#6344F5"></stop>
                                <stop offset="100%" stopColor="#AE48FF" stopOpacity="0"></stop>
                            </motion.linearGradient>
                        ))}

                        <radialGradient
                            id="paint0_radial_242_278"
                            cx="0"
                            cy="0"
                            r="1"
                            gradientUnits="userSpaceOnUse"
                            gradientTransform="translate(352 34) rotate(90) scale(555 1560.62)"
                        >
                            <stop offset="0.0666667" stopColor="var(--neutral-300)"></stop>
                            <stop offset="0.243243" stopColor="var(--neutral-300)"></stop>
                            <stop offset="0.43594" stopColor="white" stopOpacity="0"></stop>
                        </radialGradient>
                    </defs>
                </svg>
            </div>
        )
    },
)

BackgroundBeams.displayName = "BackgroundBeams"
