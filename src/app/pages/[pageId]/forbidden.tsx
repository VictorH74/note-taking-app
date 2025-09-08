export default function Forbidden() {
    return (
        <div className="grid place-items-center min-h-screen w-full sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="text-center space-y-2" >
                <h1 className='text-red-400 text-4xl'>402</h1>
                <h2 className="text-2xl font-bold">Unauthorized</h2>
                <p className="text-lg">This is a private page.</p>
            </main>
        </div>
    )
}