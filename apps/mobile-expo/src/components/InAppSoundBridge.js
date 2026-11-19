import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { registerAudioPlayer } from '../services/soundAlertService';

/**
 * Invisible WebAudio Sound Engine for React Native
 * Generates instant phone ringing bells & alert chimes directly on the device
 * without requiring external MP3 files or native audio modules.
 */
export default function InAppSoundBridge() {
  const webViewRef = useRef(null);

  useEffect(() => {
    registerAudioPlayer((type) => {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          if (window.playSound) {
            window.playSound('${type}');
          }
          true;
        `);
      }
    });
  }, []);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="background:transparent; margin:0; padding:0;">
  <script>
    var audioCtx = null;
    var activeOscillators = [];
    var ringInterval = null;

    function getAudioContext() {
      if (!audioCtx) {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    function stopAll() {
      if (ringInterval) {
        clearInterval(ringInterval);
        ringInterval = null;
      }
      activeOscillators.forEach(function(osc) {
        try { osc.stop(); osc.disconnect(); } catch(e){}
      });
      activeOscillators = [];
    }

    // Dual-Tone Telephone Ring Pulse (853Hz + 960Hz standard ring)
    function playSingleRing() {
      try {
        var ctx = getAudioContext();
        var now = ctx.currentTime;
        var gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.01, now);
        gainNode.gain.exponentialRampToValueAtTime(0.35, now + 0.05);
        gainNode.gain.setValueAtTime(0.35, now + 1.2);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        gainNode.connect(ctx.destination);

        var osc1 = ctx.createOscillator();
        var osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(853, now);
        osc2.frequency.setValueAtTime(960, now);
        osc1.connect(gainNode);
        osc2.connect(gainNode);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.5);
        osc2.stop(now + 1.5);

        activeOscillators.push(osc1, osc2);
      } catch(e) {}
    }

    // Crisp Modern Notification Chime (D5 -> A5)
    function playNotificationChime() {
      try {
        stopAll();
        var ctx = getAudioContext();
        var now = ctx.currentTime;

        var gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.exponentialRampToValueAtTime(0.4, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        gain.connect(ctx.destination);

        var osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.15);
        osc.connect(gain);

        osc.start(now);
        osc.stop(now + 0.8);
        activeOscillators.push(osc);
      } catch(e) {}
    }

    window.playSound = function(type) {
      if (type === 'RING') {
        stopAll();
        playSingleRing();
        ringInterval = setInterval(playSingleRing, 2600);
      } else if (type === 'CHIME') {
        playNotificationChime();
      } else if (type === 'STOP') {
        stopAll();
      }
    };
  </script>
</body>
</html>
  `;

  return (
    <View style={styles.hiddenContainer} pointerEvents="none">
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.hiddenWebview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenContainer: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
    bottom: -100,
    left: -100,
  },
  hiddenWebview: {
    width: 1,
    height: 1,
  },
});
