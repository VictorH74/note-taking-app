import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="grid place-items-center w-full min-h-screen font-[family-name:var(--font-geist-sans)]">
            <main className="text-center space-y-2">
                <h1 className='text-yellow-400 text-4xl'>404</h1>
                <h2 className='text-3xl'>Not Found</h2>
                <p>Could not find requested resource</p>
                <Link href="/">Go to my pages</Link>
            </main>
        </div>
    )
}