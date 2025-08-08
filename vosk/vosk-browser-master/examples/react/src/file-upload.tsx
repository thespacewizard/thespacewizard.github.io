import React, { createRef, useRef, useState } from "react";
import { Button, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { KaldiRecognizer } from "vosk-browser";

const StyledButton = styled(Button)`
  box-sizing: border-box;
  margin-left: 0.5rem;
`;

interface Props {
  recognizer: KaldiRecognizer | undefined;
  ready: boolean;
  loading: boolean;
}

const FileUpload: React.FunctionComponent<Props> = ({
  recognizer,
  ready,
  loading,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioSource, setAudioSource] = useState<MediaElementAudioSourceNode>();
  const [audioContext, setAudioContext] = useState<AudioContext>();

  const onChange = ({ file }: any) => {
    if (recognizer && audioRef.current) {
      const fileUrl = URL.createObjectURL(file.originFileObj);
      const audioPlayer = audioRef.current;
      audioPlayer.src = fileUrl;

      const _audioContext = audioContext ?? new AudioContext();

      const recognizerNode = _audioContext.createScriptProcessor(4096, 1, 1);
      recognizerNode.onaudioprocess = (event) => {
        try {
          if (
            audioPlayer.currentTime < audioPlayer.duration &&
            !audioPlayer.paused
          ) {
            recognizer.acceptWaveform(event.inputBuffer);
          }
        } catch (error) {
          console.error("acceptWaveform failed", error);
        }
      };

      const _audioSource =
        audioSource ?? _audioContext.createMediaElementSource(audioPlayer);

      _audioSource.disconnect();
      _audioSource.connect(recognizerNode);
      // TODO: investigate why recognition quality worsens when recognizerNode is connected
      // to destination
      //
      // Uncomment the next line for it to work in Chrome.
      // recognizerNode.connect(_audioContext.destination);

      setAudioSource(_audioSource);
      setAudioContext(_audioContext);
    }
  };

  const dummyRequest = ({ file, onSuccess }: any) => {
    onSuccess("ok");
  };

  return (
    <>
      <Upload
        onChange={onChange}
        customRequest={dummyRequest}
        accept="audio/*"
        showUploadList={false}
      >
        <StyledButton icon={<UploadOutlined />} disabled={!ready || loading}>
          Upload File
        </StyledButton>
      </Upload>
      <audio ref={audioRef} autoPlay></audio>
    </>
  );
};

export default FileUpload;
