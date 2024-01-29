import {useEffect, useMemo, useState} from "react";
import {
    Building, Town
} from "../model/model";
import {FirebaseApp} from "@firebase/app";
import {
    collection,
    doc,
    DocumentData,
    onSnapshot,
    getFirestore,
    SnapshotOptions,
} from 'firebase/firestore';

const TOWN_COLLECTION = `towns`;
const BUILDING_COLLECTION = `buildings`;

const buildingConverter = {
    toFirestore: (building: Building) => {
        return {...building}
    },
    fromFirestore: (snapshot: DocumentData, options: SnapshotOptions): Building => {
        const data = snapshot.data(options)!;
        return {
            ...data
        } as Building;
    }
}

const townConverter = {
    toFirestore: (session: Town) => {
        return {...session}
    },
    fromFirestore: (snapshot: DocumentData, options: SnapshotOptions): Town => {
        const data = snapshot.data(options)!;
        return {
            ...data
        } as Town;
    }
}


export const useTown = (app: FirebaseApp | undefined, townId: string) => {
    const db = useMemo(() => app ? getFirestore(app) : undefined, [app])

    const [town, setTown] = useState<Town>({prosperity: 0, name: '', id: '', morale: 0, buildings: []})

    useEffect(() => {
        if (!db || !townId) {
            return
        }
        return onSnapshot(doc(db, TOWN_COLLECTION, townId).withConverter(townConverter), (hit) => {
            setTown(prev => ({...prev, ...hit.data()!}))
        });
    }, [db, townId])

    useEffect(() => {
        if (!db || !townId) {
            return
        }
        return onSnapshot(collection(db, TOWN_COLLECTION, townId, BUILDING_COLLECTION).withConverter(buildingConverter), (hits) => {
            setTown(prev => ({...prev, buildings: hits.docs.map(it => it.data())}))
        });

    }, [db, townId])

    return {town}


}
