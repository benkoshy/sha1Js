importScripts('https://cdn.jsdelivr.net/npm/hash-wasm');

const chunkSize = 64 * 1024 * 1024;
const fileReader = new FileReader();
let hasher = null;

function hashChunk(chunk) {
  return new Promise((resolve, reject) => {
    fileReader.onload = async(e) => {
      const view = new Uint8Array(e.target.result);
      hasher.update(view);
      resolve();
    };

    fileReader.readAsArrayBuffer(chunk);
  });
}

const readFile = async(file, file_id) => {
  if (hasher) {
    hasher.init();
  } else {
    hasher = await hashwasm.createSHA1();
  }

  const chunkNumber = Math.floor(file.size / chunkSize);

  for (let i = 0; i <= chunkNumber; i++) {
    const chunk = file.slice(
      chunkSize * i,
      Math.min(chunkSize * (i + 1), file.size)
    );
    await hashChunk(chunk);

    var output = {
      type: 'progress',
      file_id: file_id,
      progress:  parseInt(100 * i / chunkNumber)
    }
    self.postMessage(output);
  }

  const hash = hasher.digest();
  return Promise.resolve(hash);
};

self.addEventListener('message', function (event) {
  var output, block, file, file_id, start, end, duration, fileSizeMB, throughput;
  block = event.data.block;
  file = event.data.file;
  file_id = block.file_id;
  event = null;

  output = {
      'block' : block
  };

  start = Date.now();
  readFile(file, file_id)
    .then((sha_result) => {
      end = Date.now();
      duration = (end - start) / 1000;
      fileSizeMB = file.size / 1024 / 1024;
      throughput = fileSizeMB / (duration / 1000);
      output.hash = sha_result;
      output.duration = duration.toFixed(2);
      self.postMessage(output);
    })

}, false);