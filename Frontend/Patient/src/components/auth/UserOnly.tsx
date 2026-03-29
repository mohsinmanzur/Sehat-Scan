import { router } from "expo-router";
import { useUser } from "../../hooks/useUser";
import { useEffect } from "react";
import LoadingScreen from "../LoadingScreen";

export const UserOnly = ({ children }: { children: React.ReactNode }) =>
{
    const { user, isInitialized } = useUser();
    
    useEffect(() =>{
        if (isInitialized && !user)
        {
            router.replace("/login");
        }
    }, [user, isInitialized]);

    if (!isInitialized || !user)
    {
        return <LoadingScreen />;
    }

    return children;
}