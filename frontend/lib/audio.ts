export async function toWavBlob(blob: Blob, sampleRate = 16000): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) throw new Error("Web Audio not supported");
  const audioContext = new AudioContextCtor();
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const channels = 1;
    const source = audioBuffer.getChannelData(0);
    const length = Math.max(1, Math.floor((audioBuffer.length * sampleRate) / audioBuffer.sampleRate));
    const pcm = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      const sourceIndex = Math.min(source.length - 1, Math.floor((i * source.length) / length));
      pcm[i] = source[sourceIndex];
    }

    const dataSize = length * channels * 2;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * 2, true);
    view.setUint16(32, channels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < length; i++, offset += 2) {
      const sample = Math.max(-1, Math.min(1, pcm[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    }
    return new Blob([buffer], { type: "audio/wav" });
  } finally {
    void audioContext.close();
  }
}
