from __future__ import annotations

import tensorflow as tf
from tensorflow.keras import layers


@tf.keras.utils.register_keras_serializable(package="herbal_ai")
class RandomBrightness(layers.Layer):
    """
    Brightness jitter in 0..255 image space.

    Implemented as a custom layer so the augmentation is saved inside the model.
    """

    def __init__(self, factor: float = 0.4, **kwargs):
        super().__init__(**kwargs)
        self.factor = float(factor)

    def call(self, inputs, training=None):
        if training is False:
            return inputs
        delta = self.factor * 255.0
        return tf.image.random_brightness(inputs, max_delta=delta)

    def get_config(self):
        cfg = super().get_config()
        cfg.update({"factor": self.factor})
        return cfg


@tf.keras.utils.register_keras_serializable(package="herbal_ai")
class RandomBackground(layers.Layer):
    """
    Roughly removes background bias by replacing non-leaf pixels with random noise/color.

    Uses an ExG-like heuristic mask: 2G - R - B combined with green dominance.
    This is intentionally approximate, but it helps break "clean background" overfitting.
    """

    def __init__(self, prob: float = 0.6, percentile: float = 70.0, **kwargs):
        super().__init__(**kwargs)
        self.prob = float(prob)
        self.percentile = float(percentile)

    def call(self, inputs, training=None):
        if training is False:
            return inputs

        x = tf.cast(inputs, tf.float32)
        batch = tf.shape(x)[0]

        # Apply per-sample with probability.
        do = tf.random.uniform((batch, 1, 1, 1), 0, 1, dtype=tf.float32) < self.prob

        r, g, b = x[..., 0:1], x[..., 1:2], x[..., 2:3]
        exg = 2.0 * g - r - b

        # Per-image threshold at percentile on ExG.
        flat = tf.reshape(exg, (batch, -1))
        k = tf.maximum(1, tf.cast(tf.round(self.percentile / 100.0 * tf.cast(tf.shape(flat)[1], tf.float32)), tf.int32))
        # kth largest => threshold (approx percentile)
        values = tf.sort(flat, axis=1)
        thr = values[:, tf.shape(values)[1] - k : tf.shape(values)[1] - k + 1]  # (B,1)
        thr = tf.reshape(thr, (batch, 1, 1, 1))

        green_dom = (g > r) & (g > b)
        mask = (exg > thr) & tf.cast(green_dom, tf.bool)
        mask = tf.cast(mask, tf.float32)

        # Random background: mix of noise + random solid color.
        noise = tf.random.uniform(tf.shape(x), 0.0, 255.0, dtype=tf.float32)
        solid = tf.random.uniform((batch, 1, 1, 3), 0.0, 255.0, dtype=tf.float32)
        bg = 0.7 * noise + 0.3 * solid

        out = mask * x + (1.0 - mask) * bg
        return tf.where(do, out, x)

    def get_config(self):
        cfg = super().get_config()
        cfg.update({"prob": self.prob, "percentile": self.percentile})
        return cfg

