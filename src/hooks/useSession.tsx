import {useCallback, useEffect, useMemo, useState} from "react";
import {
    FirebaseSession,
    FirebaseSessionMonster,
    hydrateSessionMonster, Level,
    Monster,
    newSessionMonster, NORMAL, Rank,
    SessionMonster
} from "../model/model";
import {FirebaseApp} from "@firebase/app";
import {
    writeBatch,
    collection,
    updateDoc,
    deleteDoc,
    doc,
    DocumentData,
    onSnapshot,
    getDoc,
    getDocs,
    getFirestore,
    query,
    setDoc,
    SnapshotOptions,
} from 'firebase/firestore';
import {monsterConverter} from "./useSearch";

const SESSION_COLLECTION = `sessionv2`;

const sessionConverter = {
    toFirestore: (session: FirebaseSession) => {
        return {...session}
    },

    fromFirestore: (snapshot: DocumentData, options: SnapshotOptions): FirebaseSession => {
        const data = snapshot.data(options)!;
        return {
            ...data
        } as FirebaseSession;
    }
}

const sessionMonsterConverter = {
    toFirestore: (sessionMonster: SessionMonster) => {
        const converted = {
            id: sessionMonster.id,
            rank: sessionMonster.rank,
            tokenHp: sessionMonster.tokenHp,
            monsterRef: sessionMonster.monsterRef,
        } as FirebaseSessionMonster
        return converted;
    },
    fromFirestore: (snapshot: DocumentData, options: SnapshotOptions): FirebaseSessionMonster => {
        const data = snapshot.data(options)!;
        return {
            ...data
        } as FirebaseSessionMonster;
    }
};


export const useSession = (app: FirebaseApp | undefined, sessionId: string | undefined) => {
    const [session, setSession] = useState<FirebaseSession>()
    const [list, setList] = useState<SessionMonster[]>([])

    const db = useMemo(() => app ? getFirestore(app) : undefined, [app])

    const resetSession = useCallback(() => {
        if (db && sessionId) {
            return updateDoc(doc(db, SESSION_COLLECTION, sessionId), {
                round: 1,
                fire: 0,
                ice: 0,
                earth: 0,
                wind: 0,
                dark: 0,
                light: 0,
                monstersRef: `${SESSION_COLLECTION}/${sessionId}/monsters`
            })
                .then(() =>
                    getDocs(
                        query(collection(db, SESSION_COLLECTION, sessionId, `monsters`))
                            .withConverter(sessionMonsterConverter)
                    ).then(it => it.docs.map(d => d.data()))
                )
                .then(monsters => {
                    const batch = writeBatch(db);
                    monsters.forEach(monster => batch.update(doc(db, SESSION_COLLECTION, sessionId, `monsters`, monster.id).withConverter(sessionMonsterConverter),
                        {
                            rank: monster.rank.map(() => NORMAL),
                            tokenHp: monster.tokenHp.map(() => 0),
                        }
                    ));
                    return batch.commit()
                })
        }

        return Promise.reject('no session id selected')
    }, [db, sessionId])

    const setLevel = useCallback((level: Level) => {
        if (db && sessionId) {
            return updateDoc(doc(db, SESSION_COLLECTION, sessionId), {level})
        }
    }, [db, sessionId])

    const refreshSession = useCallback(async (_session?: FirebaseSession) => {
        if (!db || !_session) {
            return
        }
        setSession(_session)
    }, [db])

    const refreshMonsters = useCallback(async (monsters?: FirebaseSessionMonster[]) => {
        if (!db || !monsters?.length || !session) {
            setList([])
            return
        }

        const hydrated = await Promise.all(monsters.map(async (hit) =>
            hydrateSessionMonster(await getDoc(doc(db, hit.monsterRef).withConverter(monsterConverter)).then(it => it.data() as Monster), hit, session!.level)
        ))

        setList(hydrated)
    }, [db, session])

    const setElements = useCallback((element: Partial<FirebaseSession>) => {
        if (!session || !db || !sessionId) {
            return Promise.reject('not ready')
        }
        return setDoc(doc(db, SESSION_COLLECTION, sessionId).withConverter(sessionConverter), {...session, ...element})
    }, [session, db, sessionId])

    const advanceRound = useCallback(() => {
        if (!session || !db || !sessionId) {
            return Promise.reject('not ready')
        }
       return  setDoc(doc(db, SESSION_COLLECTION, sessionId).withConverter(sessionConverter), {...session,
            round: session.round+1,
            fire: Math.max(0, session.fire -1),
            ice: Math.max(0, session.ice -1),
            earth: Math.max(0, session.earth -1),
            wind: Math.max(0, session.wind -1),
            light: Math.max(0, session.light -1),
            dark: Math.max(0, session.dark -1)
        })
    }, [session, db, sessionId])

    const back = useCallback(() => {
        if (!session || !db || !sessionId) {
            return Promise.reject('not ready')
        }



        return setDoc(doc(db, SESSION_COLLECTION, sessionId).withConverter(sessionConverter), {...session,
            round: Math.max(0, session.round-1)
        })

    }, [session, db, sessionId])

    const add = useCallback((monster: Monster) => {
        if (!session || !db) {
            return Promise.reject('not ready')
        }
       return setDoc(doc(db, session.monstersRef, monster.id).withConverter(sessionMonsterConverter), newSessionMonster(monster, session.level))
    }, [session, db])

    const remove = useCallback((monster: Monster) => {
        if (!session || !db) {
            return Promise.reject('not ready')
        }
        return deleteDoc(doc(db, session.monstersRef, monster.id))
    }, [db, session])

    const createToken = useCallback((monster: SessionMonster, rank: Rank, token: number) => {
        if (!session || !db) {
            return Promise.reject('not ready')
        }
        return setDoc(doc(db, session.monstersRef, monster.id).withConverter(sessionMonsterConverter), {
            ...monster,
            rank: monster.rank.map((original, index) => index === token-1 ? rank : original),
            tokenHp: monster.tokenHp.map((original, index) => index === token-1 ? monster.monster.hp[2*monster.level+rank] : original),
        } as SessionMonster)
    }, [db, session])

    const removeToken = useCallback((monster: SessionMonster, token: number) => {
        if (!session || !db) {
            return Promise.reject('not ready')
        }

        return setDoc(doc(db, session.monstersRef, monster.id).withConverter(sessionMonsterConverter), {
            ...monster,
            rank: monster.rank.map((original, index) => index === token-1 ? NORMAL : original),
            tokenHp: monster.tokenHp.map((original, index) => index === token-1 ? 0 : original),
        } as SessionMonster)
    }, [db, session])

    const setTokenHp = useCallback((monster: SessionMonster, token: number, nextHp: number) => {
        if (!session || !db) {
            return Promise.reject('not ready')
        }

        if (nextHp > monster.monster.hp[2*monster.level+monster.rank[token-1]]) {
            nextHp = monster.monster.hp[2*monster.level+monster.rank[token-1]];
        }
        if (nextHp < 0) {
            nextHp = 0;
        }

       return setDoc(doc(db, session.monstersRef, monster.id).withConverter(sessionMonsterConverter), {
            ...monster,
           rank: nextHp > 0 ? monster.rank : monster.rank.map((original, index) => index === token -1 ? NORMAL : original),
           // rank: nextHp === 0 ? NORMAL : monster.rank,
            tokenHp: monster.tokenHp.map((original, index) => index === token-1 ? nextHp : original),
        } as SessionMonster)
    }, [db, session])

    useEffect(() => {
        if (!db || !sessionId) {
            return
        }
        return onSnapshot(doc(db, SESSION_COLLECTION, sessionId).withConverter(sessionConverter), (hits) => {
           refreshSession(hits.data()).catch(console.log)
        });
    }, [db, sessionId, refreshSession])

    useEffect(() => {
        if (!db || !sessionId) {
            return
        }
        return onSnapshot(collection(db, SESSION_COLLECTION, sessionId, `monsters`).withConverter(sessionMonsterConverter), (hits) => {
            refreshMonsters(hits.docs.map(it => it.data())).catch(console.log)
        });

    }, [db, sessionId, refreshMonsters])

    return {level: session?.level, setLevel, back, advanceRound, add, remove, list, resetSession, createToken,removeToken, setTokenHp, setElement: setElements,
        round: session?.round,
        elements: {earth: session?.earth, fire: session?.fire, ice: session?.ice, wind: session?.wind, light: session?.light, dark: session?.dark}}
}
