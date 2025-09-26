import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SiGoogle, SiFacebook } from '@icons-pack/react-simple-icons'

interface SignInPageProps {
  onClose?: () => void
  redirectTo?: string
}

export default function SignInPage({ onClose, redirectTo }: SignInPageProps) {
  const { signIn, status } = useAuth()

  const handleSignIn = async (provider: 'google' | 'facebook') => {
    const callbackUrl = redirectTo || window.location.href

    try {
      // Create the sign-in URL with callback
      const signInUrl = new URL(`/auth/signin/${provider}`, window.location.origin)
      signInUrl.searchParams.set('callbackUrl', callbackUrl)

      // Redirect to sign-in
      window.location.href = signInUrl.toString()
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl border border-gray-200">
        <CardHeader className="text-center border-b border-gray-200">
          <CardTitle className="text-2xl text-gray-900">Sign In to Petition Platform</CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            Sign in to create petitions and show your support
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Button
            onClick={() => handleSignIn('google')}
            disabled={status === 'loading'}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 flex items-center justify-center gap-3 py-3"
          >
            <SiGoogle className="w-5 h-5 text-[#4285f4]" />
            Continue with Google
          </Button>

          <Button
            onClick={() => handleSignIn('facebook')}
            disabled={status === 'loading'}
            className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white flex items-center justify-center gap-3 py-3"
          >
            <SiFacebook className="w-5 h-5 text-white" />
            Continue with Facebook
          </Button>

          <div className="text-center text-sm text-gray-500 mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>

          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full mt-4 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}