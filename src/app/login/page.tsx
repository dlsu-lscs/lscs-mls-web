import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - LSCS Logo */}
      <div className="hidden md:flex md:w-2/5 bg-[#002D57] flex-col items-center justify-center px-8">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="MackyDo Logo"
            width={280}
            height={280}
            className="object-contain"
          />
        </div>

        {/* Project Title */}
        <h1 className="text-5xl font-bold text-[#E8C468] mb-4">
          MackyDo
        </h1>

        {/* Welcome Message */}
        <div>
          <p className="text-[#E8C468] text-xl">
            Welcome to MackyDo!
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-3/5 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Login
          </h2>
          <p className="text-gray-600 mb-8">
            Please log in to your account
          </p>

          <form className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C468] focus:border-transparent text-gray-900 placeholder-gray-400"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C468] focus:border-transparent text-gray-900 placeholder-gray-400"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                className="h-4 w-4 text-[#E8C468] focus:ring-[#E8C468] border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <a href="/signup" className="text-[#E8C468] hover:underline font-medium">
                  Sign up
                </a>
              </p>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-[#E8C468] text-white py-3 rounded-lg font-semibold hover:bg-[#d4b359] transition-colors duration-200"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

