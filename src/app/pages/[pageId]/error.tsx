'use client' // Error boundaries must be Client Components
import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="grid place-items-center w-full min-h-screen font-[family-name:var(--font-geist-sans)]">
            <main className="text-center space-y-2">
                <h1 className='text-red-400 text-4xl'>505</h1>
                <h2 className='text-xl'>Something went wrong!</h2>
                <button
                    onClick={
                        () => reset()
                    }
                >
                    Try again
                </button>
            </main>
        </div>
    )
}