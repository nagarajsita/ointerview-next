
import { signIn } from "@/auth"
 
export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("github",{redirectTo:'/dashboard'});
      }}
      className="w-full h-full flex"
    >
      <button type="submit"  className="w-full justify-center items-center">Signin with Github</button>
    </form>
  )
} 