import { ArrowLeft, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const ResetPassword = () => {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-900 rounded-xl p-8 border border-zinc-800">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-14 h-14 rounded-xl bg-purple/20 border border-purple/30 flex items-center justify-center">
                        <KeyRound size={28} className="text-purple-light" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-white text-center mb-2">
                    Reset Password
                </h1>
                <p className="text-gray-400 text-sm text-center mb-8">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                {/* Form */}
                <form className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="your.email@example.com"
                            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all hover:shadow-glow-purple"
                    >
                        Send Reset Link
                    </button>
                </form>

                {/* Back to Login */}
                <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 mt-6 text-gray-400 text-sm hover:text-white transition-colors"
                >
                    <ArrowLeft size={16} />
                    <span>Back to Login</span>
                </Link>

                {/* Support Link */}
                <p className="text-center text-gray-500 text-xs mt-8">
                    Didn't receive the email? Check your spam folder or{' '}
                    <Link to="/support" className="text-purple-light hover:text-purple transition-colors">
                        contact support
                    </Link>
                    .
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
