import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderKanban, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { handleApiError } from "../utils/errorHandler";
import { useToast } from "../components/ui/Toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, state } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  if (state.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      addToast(handleApiError(err), "error");
    }
  };

  const onInvalid = (errors: any) => {
    // Show a toast for the first error found
    for (const key in errors) {
      if (errors[key].message) {
        addToast(errors[key].message, "error");
        break;
      }
    }
  };

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <motion.div
          className="mx-auto grid w-[380px] gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid gap-2 text-center">
            <Link
              to="/"
              className="flex items-center justify-center space-x-2 mb-4"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">WiseCamp</span>
            </Link>
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-gray-500">
              Enter your email below to login to your account
            </p>
          </div>

          <div className="grid gap-4">
            <form
              noValidate
              className="space-y-4"
              onSubmit={handleSubmit(onSubmit, onInvalid)}
            >
              <div className="grid gap-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  className={`w-full px-3 py-2 border ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm`}
                  placeholder="m@example.com"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                 
                </div>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className={`w-full px-3 py-2 pr-10 border ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    } rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || state.isLoading}
                className="w-full justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting || state.isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>
          <div className=" text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="underline">
              Sign up
            </Link>
          </div>
        </motion.div>
      </div>
      <div className="hidden bg-gray-100 lg:flex items-center justify-center p-12 bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-center max-w-md">
          <h2 className="text-4xl font-bold">Streamline Your Workflow.</h2>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands of teams who use WiseCamp to organize, plan, and
            execute their projects.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
