import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../auth/login_screen.dart';

class LanguageOption {
  final String code;
  final String nativeName;
  final String englishName;
  final String letter;

  const LanguageOption({
    required this.code,
    required this.nativeName,
    required this.englishName,
    required this.letter,
  });
}

class LanguageSelectScreen extends StatefulWidget {
  const LanguageSelectScreen({super.key});

  @override
  State<LanguageSelectScreen> createState() => _LanguageSelectScreenState();
}

class _LanguageSelectScreenState extends State<LanguageSelectScreen> {
  String _selectedLocale = 'en';

  final List<LanguageOption> _languages = const [
    LanguageOption(code: 'en', nativeName: 'English', englishName: 'English', letter: 'A'),
    LanguageOption(code: 'hi', nativeName: 'हिंदी', englishName: 'Hindi', letter: 'अ'),
    LanguageOption(code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', letter: 'અ'),
    LanguageOption(code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', letter: 'अ'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('MISTRI PRO'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Choose your language / अपनी भाषा चुनें',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: MistriTheme.textDark,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'You can always change your preferred language later in settings.',
              style: TextStyle(
                fontSize: 14,
                color: MistriTheme.textMuted,
              ),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: ListView.separated(
                itemCount: _languages.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final lang = _languages[index];
                  final isSelected = lang.code == _selectedLocale;

                  return InkWell(
                    onTap: () {
                      setState(() {
                        _selectedLocale = lang.code;
                      });
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isSelected ? MistriTheme.primaryBlue : const Color(0xFFE2E8F0),
                          width: isSelected ? 2 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: isSelected ? MistriTheme.primaryBlue : const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Center(
                              child: Text(
                                lang.letter,
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected ? Colors.white : MistriTheme.primaryBlue,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  lang.nativeName,
                                  style: const TextStyle(
                                    fontSize: 17,
                                    fontWeight: FontWeight.bold,
                                    color: MistriTheme.textDark,
                                  ),
                                ),
                                Text(
                                  lang.englishName,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: MistriTheme.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Radio<String>(
                            value: lang.code,
                            groupValue: _selectedLocale,
                            activeColor: MistriTheme.primaryBlue,
                            onChanged: (val) {
                              if (val != null) setState(() => _selectedLocale = val);
                            },
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => LoginScreen(selectedLocale: _selectedLocale),
                  ),
                );
              },
              child: const Text('Continue / आगे बढ़ें'),
            ),
          ],
        ),
      ),
    );
  }
}
