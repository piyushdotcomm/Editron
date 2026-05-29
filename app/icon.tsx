import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            <div
                className={
                    'w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-red-700 text-white rounded-[6px] font-extrabold text-[20px]'
                }
            >
                E
            </div>
        ),
        {
            ...size,
        }
    )
}
