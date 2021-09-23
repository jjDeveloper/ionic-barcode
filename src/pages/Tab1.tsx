import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import ExploreContainer from "../components/ExploreContainer";
import "./Tab1.css";
import { CameraPreview } from '@capacitor-community/camera-preview'
import { BrowserCodeReader } from '@zxing/browser';
import { BrowserMultiFormatReader, BarcodeFormat, Result } from '@zxing/library';
import { isConstructorDeclaration, resolveTypeReferenceDirective } from "typescript";

const getVideoInputDevices = async () => {
  return await BrowserCodeReader.listVideoInputDevices();
}
const Tab1: React.FC = () => {
  const [codeReader, setCodeReader] = useState(new BrowserMultiFormatReader())
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[] | undefined>(undefined);
  const [selectedVideoInputDevice, setSelectedVideoInputDevice] = useState<MediaDeviceInfo>({} as MediaDeviceInfo)
  const [scannedBarcode, setScannedBarcode] = useState<Result | undefined>(undefined)

  useEffect(() => {
    if (scannedBarcode === undefined) return;
    const url = 'https://3000-azure-armadillo-t4oaocm1.ws-us17.gitpod.io/'
    // const url = 'https://localhost:3000/'
    const head: HeadersInit = [['Accept', 'application/json'], ['Content-Type', 'application/json']]
    const mode: RequestMode = 'cors'
    const body: BodyInit = JSON.stringify({ barcode: scannedBarcode })
    let requestOptions: RequestInit = {
      method: 'POST',
      mode: mode,
      headers: head,
      body: body
    };
    console.log(`Scanned barcode: ${scannedBarcode}`);
    fetch(url, requestOptions).then(r => console.log(r)).catch(e => console.error(e))

  }, [scannedBarcode])
  useEffect(() => {
    getVideoInputDevices().then(i => setVideoInputDevices(i))
  }, [])
  useEffect(() => {
    console.log(videoInputDevices)
    if (videoInputDevices === undefined) return;
    if (videoInputDevices.length > 0) {
      setSelectedVideoInputDevice(videoInputDevices[0])
    }
  }, [videoInputDevices])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Barcode Scanner</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent id="content" className="content-camera-preview" >
        <p className="ion-padding-start ion-padding-end">
          <IonButton
            expand="block"
            style={{ zIndex: "99999" }}
            onClick={() => {
              const previewElem: HTMLVideoElement = document.querySelector('#cap-preview') as HTMLVideoElement;
              const out = codeReader.decodeOnceFromVideoDevice(selectedVideoInputDevice.deviceId, previewElem)
              out.then(r => {
                setScannedBarcode(r)
                codeReader.reset();
              }).catch(e => console.error(e))
            }}
          >
            Scan Barcode
          </IonButton>
          <IonButton
            expand="block"
            fill="outline"
            style={{ zIndex: "99999" }}
            onClick={() => {
              codeReader.reset()
            }}
          >
            Stop
          </IonButton>
        </p>
        {scannedBarcode && <p>{JSON.stringify(scannedBarcode)}</p>}
        <p className="ion-padding-start ion-padding-end">
          <video id="cap-preview"></video>
        </p>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;