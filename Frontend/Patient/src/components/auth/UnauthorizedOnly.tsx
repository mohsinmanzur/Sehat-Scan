import { router } from "expo-router";
import { useUser } from "../../hooks/useUser";
import { useEffect } from "react";
import LoadingScreen from "../LoadingScreen";

export const UnauthorizedOnly = ({ children }: { children: React.ReactNode }) =>
{
    const { user, isInitialized } = useUser();
    
    useEffect(() =>{
        if (isInitialized && user)
        {
            router.replace("/profile");
        }
    }, [user, isInitialized]);

    if (!isInitialized || user)
    {
        return <LoadingScreen />;
    }

    return children;
}