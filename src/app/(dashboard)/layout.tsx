// import { getServerSession } from "next-auth";
// import { redirect } from "next/navigation";
// import { authOptions } from "@/lib/auth";
import Layout from "@/components/Layout";
export default async function DashboardLayout({children}:{children:React.ReactNode}){
    // const s=await getServerSession(authOptions);
    // if(!s?.user)redirect("/login");
    return <Layout>
        {children}
        </Layout>}
