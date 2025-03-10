import Image from "next/image"
import Link from "next/link"

type HeaderProps = {
  showSignIn?: boolean
}

export function Header({ showSignIn = false }: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-12">
      <Link href="/">
        <Image
          src="/placeholder.svg?height=50&width=130"
          alt="GB Trader Logo"
          width={130}
          height={50}
          className="h-12 w-auto"
        />
      </Link>
      {showSignIn && (
        <div className="flex items-center gap-2 text-sm">
          <span>Not signed in</span>
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      )}
    </div>
  )
}

