import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'core/theme.dart';
import 'core/constants.dart';
import 'features/splash/splash_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MistriProApp());
}

class MistriProApp extends StatelessWidget {
  const MistriProApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: MistriConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: MistriTheme.lightTheme,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en', 'US'), // English
        Locale('hi', 'IN'), // Hindi
        Locale('gu', 'IN'), // Gujarati
        Locale('mr', 'IN'), // Marathi
      ],
      home: const SplashScreen(),
    );
  }
}
