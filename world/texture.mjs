const patterns = {
  // path: {src: './assets/paving_stones_with_moss.jpeg', pattern: null}
};

const load = async (ctx, key) => {
  return new Promise(resolve => {
    const pattern = patterns[key];
    const img = new Image();

    img.onload = function () {
      pattern.pattern = ctx.createPattern(img, 'repeat');
      resolve();
    };

    img.src = pattern.src;
  })
};

const loadTextures = async (ctx) => {
  for (const key of Object.keys(patterns)) {
    await load(ctx, key);
  }
};

export {loadTextures, patterns}