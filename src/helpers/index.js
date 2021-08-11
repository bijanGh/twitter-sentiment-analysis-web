const tf = require("@tensorflow/tfjs");

export const getMetaData = async () => {
  const metadata = await fetch(
    "https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json"
  );
  return metadata.json();
};

export const loadModel = async () => {
  const url = `https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json`;
  const model = await tf.loadLayersModel(url);
  return model;
};

const padSequences = (sequences, metadata) => {
  return sequences.map((seq) => {
    if (seq.length > metadata.max_len) {
      seq.splice(0, seq.length - metadata.max_len);
    }
    if (seq.length < metadata.max_len) {
      const pad = [];
      for (let i = 0; i < metadata.max_len - seq.length; ++i) {
        pad.push(0);
      }
      seq = pad.concat(seq);
    }
    return seq;
  });
};

const predict = (text, model, metadata) => {
  const trimmed = text
    .trim()
    .toLowerCase()
    .replace(/(\.|\,|\!,|\#,|\@)/g, "")
    .split(" ");
  const sequence = trimmed.map((word) => {
    const wordIndex = metadata.word_index[word];
    if (typeof wordIndex === "undefined") {
      return 2; //oov_index
    }
    return wordIndex + metadata.index_from;
  });
  const paddedSequence = padSequences([sequence], metadata);
  const input = tf.tensor2d(paddedSequence, [1, metadata.max_len]);

  const predictOut = model.predict(input);
  const score = predictOut.dataSync()[0];
  predictOut.dispose();
  return score;
};

const getSentiment = (score) => {
  if (score > 0.66) return `POSITIVE`;
  else if (score > 0.4) return `NEUTRAL`;
  else return `NEGATIVE`;
};

export const sentimentAnalysis = (text, model, metadata) => {
  let sum = 0;
  const tweet = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "").split(" ");
  for (const prediction of tweet) {
    const perc = predict(prediction, model, metadata);

    sum += parseFloat(perc, 10);
  }

  return getSentiment(sum / tweet.length);
};
