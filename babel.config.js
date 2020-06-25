module.exports = {
  presets: [
    [
      '@babel/preset-typescript',
      {
        allowDeclareFields: true,
      },
    ],
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
};
