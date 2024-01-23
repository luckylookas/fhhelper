import {useCallback, useMemo, useState} from "react";
import {
    collection,
    DocumentData,
    getDocs,
    getFirestore,
    limit,
    query,
    SnapshotOptions,
    where
} from 'firebase/firestore';
import {FireBaseMonster, Monster, SessionMonster} from "../model/model";
import {FirebaseApp} from "@firebase/app";

const MONSTERS_COLLECTION = `monsters`;
export const monsterConverter = {
    toFirestore: (monster: DocumentData) => {
        return {};
    },
    fromFirestore: (snapshot: DocumentData, options: SnapshotOptions): FireBaseMonster => {
        const data = snapshot.data(options)!;
        return {
            ...data,
        } as FireBaseMonster;
    }
};

export const useSearch = (app: FirebaseApp|undefined, sessionMonsters: SessionMonster[]) => {
    const [results, setResults] = useState<Monster[]>([])
    const db = useMemo(() => app ? getFirestore(app) : null, [app])

    const search = useCallback((term: string) => {
        if (db && term?.length) {

            if (sessionMonsters.length) {
                getDocs(query(collection(db, MONSTERS_COLLECTION),
                    where("ftsTokens", "array-contains", term),
                    where("id", "not-in", sessionMonsters.map(it => it.id)),
                    limit(5))
                    .withConverter(monsterConverter))
                    .then(hits => hits.docs.map(it => it.data()))
                    .then(setResults)
            } else {
                getDocs(query(collection(db, MONSTERS_COLLECTION),
                    where("ftsTokens", "array-contains", term),
                    limit(5))
                    .withConverter(monsterConverter))
                    .then(hits => hits.docs.map(it => it.data()))
                    .then(setResults)
            }
        } else {
            setResults([]);
        }
    }, [db, sessionMonsters])

    // useEffect(() => {
    //     if (db) {
    //         getDocs(query(collection(db, `monsters`))).then(docs => {
    //             if(docs.docs.length === 0) {
    //                 return getDocs(query(collection(db, `monsters-1`)).withConverter(monsterConverter)).then(docs => {
    //                     docs.forEach(monster => {
    //                         Promise.all([
    //                             getDoc(doc(db, "monsters-2", monster.id).withConverter(monsterConverter)),
    //                             getDoc(doc(db, "monsters-3", monster.id).withConverter(monsterConverter)),
    //                             getDoc(doc(db, "monsters-4", monster.id).withConverter(monsterConverter)),
    //                             getDoc(doc(db, "monsters-5", monster.id).withConverter(monsterConverter)),
    //                             getDoc(doc(db, "monsters-6", monster.id).withConverter(monsterConverter)),
    //                             getDoc(doc(db, "monsters-7", monster.id).withConverter(monsterConverter)),
    //                         ]).then(monsters =>
    //                             setDoc(doc(db, "monsters", monster.id),
    //                                 [monster.data(), ...monsters.map(it => it.data()!)]
    //                                     .reduce(
    //                                         (prev: FireBaseMonster, next: FireBaseMonster) => {
    //                                             if (!next || !next.hp) {
    //                                                 return {
    //                                                     ...prev,
    //                                                     hp: [...prev.hp, 0,0],
    //                                                     armor: [...prev.armor,  0,0],
    //                                                     attack: [...prev.attack, 0,0],
    //                                                     retaliate: [...prev.retaliate,  0,0],
    //                                                     special: [...prev.special,  '',''],
    //                                                     speed: [...prev.speed,  0,0],
    //                                                 }
    //                                             }
    //                                             return {
    //                                                 ...prev,
    //                                                 hp: [...prev.hp, ...next.hp],
    //                                                 armor: [...prev.armor, ...next.armor],
    //                                                 attack: [...prev.attack, ...next.attack],
    //                                                 retaliate: [...prev.retaliate, ...next.retaliate],
    //                                                 special: [...prev.special, ...next.special],
    //                                                 speed: [...prev.speed, ...next.speed],
    //                                             }
    //                                         },
    //                                         {
    //                                             ...monster.data() //level 0 placeholder
    //                                         } as FireBaseMonster
    //                                     ))
    //                         )
    //                     })
    //                 })
    //
    //             } else {
    //                 console.log("already filled collection")
    //             }
    //         }).catch(e => console.log("OHHH NOOOO", e))
    //         }}, [db])

    return {
        search,
        results
    }


    // useEffect(() => {
    //     if (auth && fbApp) {
    //         const db = getFirestore(fbApp);
    //         //used to sub to updates on a query or collection (always send the whole result set, not just updated records)
    //         return onSnapshot(
    //             query(collection(db, "monsters"),
    //             where("name_ngrams", "array-contains", 'alg')),
    //             (hits) => setNames(hits.docs.map(d => d.get('name') as string))
    //         );
    //
    //         // // used to sub to updates on on document (eg sub to a token that exists)
    //         // return onSnapshot(doc(db, "monsters", '<ID>'), (doc) => {
    //         //     console.log("Current data: ", doc.get('name'));
    //         // });
    //
    //     }
    // }, [auth, fbApp])


}
