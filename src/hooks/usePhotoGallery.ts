import { useState, useEffect } from "react";
import { isPlatform } from "@ionic/react";

import {
    Camera,
    CameraResultType,
    CameraSource,
    Photo,
} from "@capacitor/camera";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Storage } from "@capacitor/storage";
import { Capacitor } from "@capacitor/core";

export interface UserPhoto {
    filepath: string;
    webviewPath?: string;
}

const PHOTO_STORAGE = "photos";

export const usePhotoGallery = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    useEffect(() => {
        const loadSaved = async () => {
            const { value } = await Storage.get({ key: PHOTO_STORAGE });
            const photosInStorage = (value ? JSON.parse(value) : []) as Photo[];

            for (let photo of photosInStorage) {
                const file = await Filesystem.readFile({
                    path: photo.path!,
                    directory: Directory.Data,
                });
                // Web platform only: Load the photo as base64 data
                photo.webPath = `data:image/jpeg;base64,${file.data}`;
            }
            setPhotos(photosInStorage);
        };
        loadSaved();
    }, []);
    const takePhoto = async () => {
        const cameraPhoto = await Camera.getPhoto({
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
            quality: 100,
        });
        const fileName = new Date().getTime() + ".jpeg";
        const savedFileImage = await savePicture(cameraPhoto, fileName);
        const newPhotos = [
            // {
            //     filepath: fileName,
            //     webviewPath: cameraPhoto.webPath,
            // },
            savedFileImage,
            ...photos,
        ];
        setPhotos(newPhotos);
        Storage.set({ key: PHOTO_STORAGE, value: JSON.stringify(newPhotos) });
    };

    const savePicture = async (photo: any, fileName: string): Promise<Photo> => {
        const base64Data = await base64FromPath(photo.webPath!);
        const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Data
        });

        // Use webPath to display the new image instead of base64 since it's
        // already loaded into memory
        return {
            path: fileName,
            webPath: photo.webPath,
            format: 'jpg',
            saved: false
        };
    };

    return {
        photos,
        takePhoto,
    };
}

export async function base64FromPath(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject('method did not return a string')
            }
        };
        reader.readAsDataURL(blob);
    });
}