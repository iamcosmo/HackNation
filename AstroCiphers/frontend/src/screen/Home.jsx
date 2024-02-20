import React from "react";
import "./home.css"; // Import your custom CSS file
import Img from "../Image/img.jpg";
import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";

export default function Home() {
  const djangoUrl = "http://127.0.0.1:8000/";
  const [selectedCamera, setSelectedCamera] = useState(null);
  const webcamRef1 = useRef(null);
  const webcamRef2 = useRef(null);
  const webcamRef3 = useRef(null);
  const webcamRef4 = useRef(null);
  const [capturedImage, setCapturedImage] = useState({});
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isPredicted, setIsPredicted] = useState(false);
  const [clickButton, setClickButton] = useState("Capture");
  const [predicted, setPredicted] = useState({});
  const [videoDevices, setVideoDevices] = useState([]);
  const [imgShow, setImgShow] = useState(false);
  const red = "bg-red-500";
  const yellow = "bg-yellow-500";
  const green = "bg-green-500";
  const black = "bg-black";
  const [trafficLightColor, setTrafficLightColor] = useState({
    1: { red: black, yellow: black, green: black },
    2: { red: black, yellow: black, green: black },
    3: { red: black, yellow: black, green: black },
    4: { red: black, yellow: black, green: black },
  });
  const [trafficLightTimer, setTrafficLightTimer] = useState({
    1: 5,
    2: 5,
    3: 5,
    4: 5,
  });
  const greenDic = { red: black, yellow: black, green: green };
  const redDic = { red: red, yellow: black, green: black };
  const yellowDic = { red: black, yellow: yellow, green: black };
  const [presentActive, setPresentActive] = useState(1);
  function yellowBlink() {
    if (presentActive === 1) {
      setTrafficLightColor((prev) => ({
        ...prev,
        1: yellowDic,
        2: redDic,
        3: redDic,
        4: redDic,
      }));
      setTrafficLightTimer((prevData) => ({
        ...prevData,
        1: trafficLightTimer[1] - 1,
      }));
    } else if (presentActive === 2) {
      setTrafficLightColor((prev) => ({
        ...prev,
        2: yellowDic,
        1: redDic,
        3: redDic,
        4: redDic,
      }));
      setTrafficLightTimer((prevData) => ({
        ...prevData,
        2: trafficLightTimer[2] - 1,
      }));
    } else if (presentActive === 3) {
      setTrafficLightColor((prev) => ({
        ...prev,
        3: yellowDic,
        2: redDic,
        1: redDic,
        4: redDic,
      }));
      setTrafficLightTimer((prevData) => ({
        ...prevData,
        3: trafficLightTimer[3] - 1,
      }));
    } else if (presentActive === 4) {
      setTrafficLightColor((prev) => ({
        ...prev,
        4: yellowDic,
        2: redDic,
        3: redDic,
        1: redDic,
      }));
      setTrafficLightTimer((prevData) => ({
        ...prevData,
        4: trafficLightTimer[4] - 1,
      }));
    }
  }

  useEffect(() => {
    if (trafficLightTimer[presentActive] !== 0) {
      setTimeout(() => {
        if (
          trafficLightTimer[presentActive] > 0 &&
          trafficLightTimer[presentActive] <= 3
        ) {
          yellowBlink();
        } else if (trafficLightTimer[presentActive] > 3) {
          if (presentActive === 1) {
            setTrafficLightColor((prev) => ({
              ...prev,
              1: greenDic,
              2: redDic,
              3: redDic,
              4: redDic,
            }));
            setTrafficLightTimer((prevData) => ({
              ...prevData,
              1: trafficLightTimer[1] - 1,
            }));
          } else if (presentActive === 2) {
            setTrafficLightColor((prev) => ({
              ...prev,
              2: greenDic,
              1: redDic,
              3: redDic,
              4: redDic,
            }));
            setTrafficLightTimer((prevData) => ({
              ...prevData,
              2: trafficLightTimer[2] - 1,
            }));
          } else if (presentActive === 3) {
            setTrafficLightColor((prev) => ({
              ...prev,
              3: greenDic,
              2: redDic,
              1: redDic,
              4: redDic,
            }));
            setTrafficLightTimer((prevData) => ({
              ...prevData,
              3: trafficLightTimer[3] - 1,
            }));
          } else if (presentActive === 4) {
            setTrafficLightColor((prev) => ({
              ...prev,
              4: greenDic,
              2: redDic,
              3: redDic,
              1: redDic,
            }));
            setTrafficLightTimer((prevData) => ({
              ...prevData,
              4: trafficLightTimer[4] - 1,
            }));
          }
        }
      }, 1000);
    } else {
      setTrafficLightTimer({
        1: 5,
        2: 5,
        3: 5,
        4: 5,
      });
      let nextActive = (presentActive % 4) + 1;
      if (nextActive) setPresentActive((presentActive % 4) + 1);
    }
  });

  const getVideoDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setVideoDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Error getting video devices:", error);
    }
  };

  useEffect(() => {
    getVideoDevices();
  }, []);

  const startCamera = () => {
    setIsCameraOn(true);
  };

  const stopCamera = () => {
    setIsCameraOn(false);
    setIsPredicted(false);
    setCapturedImage(null);
    setPredicted("");
  };

  const handleCameraChange = (deviceId) => {
    setSelectedCamera(deviceId);
    stopCamera();
    startCamera();
  };

  const capture = () => {
    setIsPredicted(false);
    const imageSrc = {
      1: webcamRef1.current.getScreenshot(),
      2: webcamRef2.current.getScreenshot(),
      3: webcamRef3.current.getScreenshot(),
      4: webcamRef4.current.getScreenshot(),
    };
    setCapturedImage(imageSrc);
    setImgShow(true);
    setClickButton("Predict");
  };

  const predict = async () => {
    setPredicted({});
    let sendData = {};
    for (const k in capturedImage) {
      var imgType = "";
      let ctr = 0;
      var i = 0;
      for (i = 0; capturedImage[k][i] !== ","; i++) {
        if (capturedImage[k][i] === ";") ctr = 0;
        if (ctr !== 0) imgType += capturedImage[k][i];
        if (capturedImage[k][i] === "/") ctr = 1;
      }
      var imgUrl = capturedImage[k].substring(i + 1);
      sendData[k] = { imageUrl: imgUrl, imageType: imgType };
    }
    console.log(sendData);

    const resData = await axios
      .post(djangoUrl + "imgpredict/", {
        sendData,
      })
      .then((res) => {
        console.log(JSON.parse(res.data));
        setPredicted(JSON.parse(res.data));
        setIsPredicted(true);
        setClickButton("Capture");
      })
      .catch((err) => console.log(err));
  };
  // const predict = () => {
  //   setIsPredicted(true);
  //   setClickButton("Capture");
  //   setImgShow(false);
  // };
  // console.log(selectedCamera);
  return (
    <>
      <div className="flex justify-between mb-4">
        <div className="w-1/2 p-4 text-white">
          {imgShow === false ? (
            <Webcam
              key={videoDevices[0] ? videoDevices[0].deviceId : null}
              audio={false}
              ref={(el) => (webcamRef1.current = el)}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                deviceId: videoDevices[0] ? videoDevices[0].deviceId : null,
              }}
              style={{
                width: "74rem",
                height: "39rem",
                paddingLeft: "8rem",
                paddingRight: "8rem",
              }}
            />
          ) : (
            <img
              style={{
                width: "74rem",
                height: "39rem",
                paddingLeft: "8rem",
                paddingRight: "8rem",
              }}
              src={
                isPredicted === false
                  ? capturedImage[1]
                  : predicted[1].actualVehicles !== 0 ||
                    predicted.invalidVehicles !== 0
                  ? predicted[1].predictedUrl
                  : capturedImage[3]
              }
              alt="1st camera"
            />
          )}
        </div>

        <div className="w-1/4 p-4 text-white flex-row hello-hello-2 mx-10">
          <div className="p-2 hello-hello  mx-4">
            <div className="mx-auto mt-40 Hello-hello-hello">
              <h1 className="bg-white text-5xl py-3 px-3">
                {trafficLightTimer[1]}
              </h1>
            </div>
          </div>
          <div className="mx-auto m-1 border h-20 w-15 helo-helo-helo bg-white flex p-2">
            <div
              className={`h-7 w-7 ${trafficLightColor[1].red} m-2 rounded-full`}
            ></div>
            <div
              className={`h-7 w-7 ${trafficLightColor[1].yellow} m-2 rounded-full`}
            ></div>
            <div
              className={`h-7 w-7 ${trafficLightColor[1].green} m-2 rounded-full`}
            ></div>
          </div>
        </div>

        <div className="w-1/2 p-4 text-white">
          {imgShow === false ? (
            <Webcam
              key={videoDevices[2] ? videoDevices[2].deviceId : null}
              audio={false}
              ref={(el) => (webcamRef2.current = el)}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                deviceId: videoDevices[2] ? videoDevices[2].deviceId : null,
              }}
              style={{
                width: "74rem",
                height: "39rem",
                paddingLeft: "8rem",
                paddingRight: "8rem",
              }}
            />
          ) : (
            <img
              style={{
                width: "74rem",
                height: "39rem",
                paddingLeft: "8rem",
                paddingRight: "8rem",
              }}
              src={
                isPredicted === false
                  ? capturedImage[3]
                  : predicted[3].actualVehicles !== 0 ||
                    predicted.invalidVehicles !== 0
                  ? predicted[3].predictedUrl
                  : capturedImage[3]
              }
              alt="2nd camera"
            />
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <div className="w-1/2 p-4 text-white flex second-second mr-7">
          <div className="Hello-hello-hello mx-auto my-10">
            <h1 className="bg-white text-5xl py-3 px-3">
              {trafficLightTimer[4]}
            </h1>
          </div>

          <div className="my-auto m-1 border second-second-second bg-white flex-row justify-center p-1">
            <div
              className={`h-7 w-7 ${trafficLightColor[4].red} m-3 rounded-full`}
            ></div>
            <div
              className={`h-7 w-7 ${trafficLightColor[4].yellow} m-3 rounded-full`}
            ></div>
            <div
              className={`h-7 w-7 ${trafficLightColor[4].green} m-3 rounded-full`}
            ></div>
          </div>
        </div>

        <div className="w-1/4 p-4">
          <div className="flex justify-center items-center p-12">
            <button
              className="text-white bg-red-500 rounded-xl p-4"
              onClick={clickButton === "Capture" ? capture : predict}
            >
              {clickButton}
            </button>
          </div>
        </div>

        <div className="w-1/2 p-4 flex second-second mr-7">
          <div className="my-auto m-1 border third-second-second bg-white flex-row justify-center p-1">
            <div
              className={`h-7 w-7 ${trafficLightColor[2].red} m-3 rounded-full`}
            ></div>
            <div
              className={`h-7 w-7 ${trafficLightColor[2].yellow} m-3 rounded-full`}
            ></div>
            <div
              className={`h-7 w-7 ${trafficLightColor[2].green} m-3 rounded-full`}
            ></div>
          </div>
          <div className="Hello-hello-hello mx-auto my-10">
            <h1 className="bg-white text-5xl py-3 px-3">
              {trafficLightTimer[2]}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <div className="w-1/2 p-4 text-white">
          {imgShow === false ? (
            <Webcam
              key={videoDevices[1] ? videoDevices[1].deviceId : null}
              audio={false}
              ref={(el) => (webcamRef3.current = el)}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                deviceId: videoDevices[1] ? videoDevices[1].deviceId : null,
              }}
              style={{
                width: "74rem",
                height: "39rem",
                paddingLeft: "8rem",
                paddingRight: "8rem",
              }}
            />
          ) : (
            <img
              style={{
                width: "74rem",
                height: "39rem",
                paddingLeft: "8rem",
                paddingRight: "8rem",
              }}
              src={
                isPredicted === false
                  ? capturedImage[2]
                  : predicted[2].actualVehicles !== 0 ||
                    predicted.invalidVehicles !== 0
                  ? predicted[2].predictedUrl
                  : capturedImage[2]
              }
              alt="3rd camera"
            />
          )}
        </div>

        <div className="w-1/4 p-4 text-white flex-row hello-hello-2 mx-10">
          <div className="mx-auto m-1 border h-20 w-15 helo-helo-helo-helo bg-white flex p-2">
            <div
              className={`h-7 w-7 ${trafficLightColor[3].red} m-2 rounded-full`}
            ></div>
            <div
              className={`h-7 w-7 ${trafficLightColor[3].yellow} m-2 rounded-full`}
            ></div>
            <div
              className={`h-7 w-7 ${trafficLightColor[3].green} m-2 rounded-full`}
            ></div>
          </div>
          <div className="p-2 hello-hello  mx-4 mt-6">
            <div className="mx-auto mb-70 Hello-hello-hello">
              <h1 className="bg-white text-5xl py-3 px-3">
                {trafficLightTimer[3]}
              </h1>
            </div>
          </div>
        </div>

        <div className="w-1/2 p-4 text-white">
          {imgShow === false ? (
            <Webcam
              key={videoDevices[2] ? videoDevices[2].deviceId : null}
              audio={false}
              ref={(el) => (webcamRef4.current = el)}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                deviceId: videoDevices[2] ? videoDevices[2].deviceId : null,
              }}
              style={{
                width: "74rem",
                height: "39rem",
                paddingLeft: "8rem",
                paddingRight: "8rem",
              }}
            />
          ) : (
            <img
              style={{
                width: "74rem",
                height: "39rem",
                paddingLeft: "8rem",
                paddingRight: "8rem",
              }}
              src={
                isPredicted === false
                  ? capturedImage[3]
                  : predicted[3].actualVehicles !== 0 ||
                    predicted.invalidVehicles !== 0
                  ? predicted[3].predictedUrl
                  : capturedImage[3]
              }
              alt="4th camera"
            />
          )}
        </div>
      </div>
    </>
  );
}