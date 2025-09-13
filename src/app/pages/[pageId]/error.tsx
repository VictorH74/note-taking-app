'use client' // Error boundaries must be Client Components
import { useEffect } from 'react'

export default function Error({
    error,
}: {
    error: Error & { digest?: string }
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="grid place-items-center w-full min-h-screen font-[family-name:var(--font-geist-sans)]">
            <main className="text-center space-y-2">
                <h1 className='text-red-400 text-4xl'>505</h1>
                <h2 className='text-xl'>Something went wrong!</h2>
                <p>{JSON.stringify(error)}</p>
            </main>
        </div>
    )
}