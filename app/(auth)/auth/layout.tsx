import react from 'react';
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex justify-center items-center h-screen flex-col bg-zinc-900">
        {children}
    </main>

  )
}
export default AuthLayout;