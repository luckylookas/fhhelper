import {useEffect, useState} from "react";
import {initializeApp} from "firebase/app";
import {getAuth, signInWithEmailAndPassword} from "firebase/auth";
import {firebaseConfig} from "../firebaseconfig";
import {FirebaseApp} from "@firebase/app";

export const useFirebase = (email?: string, password?: string) => {
    const [firebaseApp, setApp] = useState<FirebaseApp>()
    const [error, setError] = useState<string>()

    useEffect(() => {
        if (!firebaseApp && password && email) {
            const auth = getAuth(initializeApp(firebaseConfig))
            setError(undefined);
            signInWithEmailAndPassword(auth, email, password)
                .then(() => {
                    setApp(auth.app)
                })
                .catch((e) => {
                    setError(e.code)
                })
        }
    }, [firebaseApp, email, password])

    return {firebaseApp, error}
}
