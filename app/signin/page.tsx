import { signIn } from "@/auth";

export default function SignIn() {
 
  return (
    <div className="flex justify-center items-center h-screen bg-grid-gray-100">
      <form action={async ()=>{
        "use server"
        await signIn("github", { callbackurl: "/dashboard" });
      }} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-100">
        <h2 className="text-3xl mb-10 text-center">Choose Method to Login/Signup</h2>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
          Sign in with GitHub
        </button>
      </form>
    </div>
  );
}
