import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  Check,
  X,
  Briefcase,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react-native';
import { DeviceFeedback } from '../services/deviceFeedback';

export const TRADE_CATEGORIES = [
  {
    id: 'civil',
    title: 'राजमिस्त्री एवं भवन निर्माण (Masonry & Civil)',
    icon: '🧱',
    skills: [
      { name: 'Mason (Raj Mistri)', icon: '🧱' },
      { name: 'Mason Helper (Beldar)', icon: '👷' },
      { name: 'Plastering Worker', icon: '🖌️' },
      { name: 'Bricklayer', icon: '🧱' },
      { name: 'Steel Fixer / Bar Bender', icon: '⛓️' },
      { name: 'Concrete Worker', icon: '🪨' },
      { name: 'Demolition Worker', icon: '🔨' },
    ],
  },
  {
    id: 'electrical',
    title: 'बिजली एवं उपकरण (Electrical & Power)',
    icon: '⚡',
    skills: [
      { name: 'Electrician', icon: '⚡' },
      { name: 'House Wiring Specialist', icon: '💡' },
      { name: 'Inverter & Solar Electrician', icon: '☀️' },
      { name: 'Motor Winder & Repair', icon: '⚙️' },
    ],
  },
  {
    id: 'plumbing',
    title: 'प्लंबिंग एवं सेनेटरी (Plumbing & Sanitation)',
    icon: '🔧',
    skills: [
      { name: 'Plumber', icon: '🔧' },
      { name: 'Pipe Fitting & Leakage Specialist', icon: '🚰' },
      { name: 'Water Tank Installation', icon: '💧' },
      { name: 'Sanitary Specialist', icon: '🚿' },
    ],
  },
  {
    id: 'painting',
    title: 'पेंटिंग एवं फिनिशिंग (Painting & Finishing)',
    icon: '🎨',
    skills: [
      { name: 'Wall Painter', icon: '🎨' },
      { name: 'Wood Polish Master', icon: '🪵' },
      { name: 'Texture & Stencil Designer', icon: '✨' },
      { name: 'Waterproofing Worker', icon: '🛡️' },
    ],
  },
  {
    id: 'carpentry',
    title: 'बढ़ई एवं लकड़ी का काम (Carpentry & Woodwork)',
    icon: '🪚',
    skills: [
      { name: 'Furniture Carpenter', icon: '🪚' },
      { name: 'Door & Window Specialist', icon: '🚪' },
      { name: 'Shuttering Carpenter', icon: '📐' },
      { name: 'Modular Kitchen Specialist', icon: '🍳' },
    ],
  },
  {
    id: 'tiles_marble',
    title: 'मार्बल, ग्रेनाइट एवं टाइल्स (Tiles & Stone)',
    icon: '🏛️',
    skills: [
      { name: 'Tile & Marble Installer', icon: '🏛️' },
      { name: 'Granite Specialist', icon: '💎' },
      { name: 'Stone Cutter & Mason', icon: '⛏️' },
      { name: 'Floor Polishing Mistri', icon: '✨' },
    ],
  },
  {
    id: 'fabrication',
    title: 'वेल्डिंग एवं मेटल फैब्रिकेशन (Fabrication & Metal)',
    icon: '🔥',
    skills: [
      { name: 'Welder', icon: '🔥' },
      { name: 'Metal Fabricator', icon: '⚙️' },
      { name: 'Grill & Gate Fabricator', icon: '🚪' },
      { name: 'Tin Shed & Truss Fabricator', icon: '🏗️' },
    ],
  },
  {
    id: 'ac_appliances',
    title: 'एसी एवं घरेलू उपकरण (AC & Appliances)',
    icon: '❄️',
    skills: [
      { name: 'AC Technician', icon: '❄️' },
      { name: 'POP & False Ceiling', icon: '📐' },
      { name: 'Appliance Repair Mistri', icon: '🔌' },
    ],
  },
  {
    id: 'labour',
    title: 'मजदूर एवं सहायक (Labour & Helper)',
    icon: '📦',
    skills: [
      { name: 'General Construction Labour', icon: '📦' },
      { name: 'Loading & Unloading Labour', icon: '🚛' },
      { name: 'Excavation Labour', icon: '⛏️' },
      { name: 'Cleaning & Housekeeping', icon: '🧹' },
      { name: 'Gardening Worker (Mali)', icon: '🌱' },
    ],
  },
];

export default function WorkerManageSkillsModal({
  visible,
  onClose,
  currentSkills = [],
  onSaveSkills,
  lang = 'en',
  insets = { top: 0, bottom: 0 },
}) {
  const [selectedSkills, setSelectedSkills] = useState(currentSkills || []);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedSkills(currentSkills || []);
  }, [currentSkills, visible]);

  const toggleSkill = (skillName) => {
    DeviceFeedback.triggerLightTap();
    setSelectedSkills((prev) => {
      if (prev.includes(skillName)) {
        return prev.filter((s) => s !== skillName);
      } else {
        return [...prev, skillName];
      }
    });
  };

  const removeSkill = (skillName) => {
    DeviceFeedback.triggerLightTap();
    setSelectedSkills((prev) => prev.filter((s) => s !== skillName));
  };

  const handleSave = async () => {
    if (selectedSkills.length === 0) {
      Alert.alert(
        lang === 'hi' ? 'कम से कम एक हुनर चुनें' : 'Select At Least One Skill',
        lang === 'hi' ? 'कृपया अपनी विशेषज्ञता में कम से कम 1 कार्य श्रेणी अवश्य चुनें।' : 'Please choose at least 1 trade skill you can execute.'
      );
      return;
    }

    setIsSaving(true);
    DeviceFeedback.triggerSuccessHaptics();
    try {
      if (onSaveSkills) {
        await onSaveSkills(selectedSkills);
      }
      setIsSaving(false);
      Alert.alert(
        lang === 'hi' ? 'हुनर सफलतापूर्वक सुरक्षित हुए! ✓' : 'Skills Saved & Synced! ✓',
        lang === 'hi' ? `आपके ${selectedSkills.length} हुनर क्लाउड प्रोफाइल पर अपडेट हो गए हैं।` : `Your ${selectedSkills.length} skills are updated and synced with cloud.`
      );
      onClose();
    } catch (e) {
      setIsSaving(false);
      Alert.alert('Error', e?.message || 'Could not save skills');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft size={22} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle}>
              {lang === 'hi' ? 'हुनर एवं कार्य श्रेणियां' : 'Manage Trade Skills'}
            </Text>
            <Text style={styles.topBarSubtitle}>
              {lang === 'hi' ? 'अपने काम के अनुसार हुनर जोड़ें या हटाएं' : 'Add or remove trade skills you execute'}
            </Text>
          </View>
          <View style={styles.topBadge}>
            <Text style={styles.topBadgeText}>
              {selectedSkills.length} {lang === 'hi' ? 'सक्रिय' : 'Active'}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Active Skills Tray */}
          <View style={styles.activeTrayCard}>
            <View style={styles.trayHeaderRow}>
              <View style={styles.trayIconWrap}>
                <Briefcase size={16} color="#16A34A" />
              </View>
              <Text style={styles.trayTitle}>
                {lang === 'hi' ? 'वर्तमान में चुने गए हुनर' : 'Currently Selected Skills'} ({selectedSkills.length})
              </Text>
            </View>

            {selectedSkills.length === 0 ? (
              <View style={styles.emptyNotice}>
                <AlertCircle size={16} color="#DC2626" />
                <Text style={styles.emptyNoticeText}>
                  {lang === 'hi' ? 'कोई हुनर नहीं चुना गया। नीचे दी गई श्रेणियों में से चुनें।' : 'No skills selected. Please pick your trades below.'}
                </Text>
              </View>
            ) : (
              <View style={styles.chipsWrap}>
                {selectedSkills.map((sk) => (
                  <View key={sk} style={styles.activeSkillChip}>
                    <Text style={styles.activeSkillText}>{sk}</Text>
                    <TouchableOpacity
                      onPress={() => removeSkill(sk)}
                      style={styles.removeChipBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <X size={13} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Trade Categories Accordion / Grid */}
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionHeading}>
              {lang === 'hi' ? 'सभी ट्रेड श्रेणियां (टैप करके चुनें या हटाएं)' : 'All Trade Categories (Tap to Add / Remove)'}
            </Text>
            <Text style={styles.sectionSubHeading}>
              {lang === 'hi' ? 'ग्राहक इन्हीं श्रेणियों में सर्च करके आपको सीधे ऑन-साइट काम के लिए कॉल करेंगे।' : 'Customers searching these trades will see your direct profile.'}
            </Text>
          </View>

          {TRADE_CATEGORIES.map((category) => (
            <View key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </View>

              <View style={styles.chipsWrap}>
                {category.skills.map((skill) => {
                  const isChecked = selectedSkills.includes(skill.name);
                  return (
                    <TouchableOpacity
                      key={skill.name}
                      onPress={() => toggleSkill(skill.name)}
                      style={[styles.skillToggleChip, isChecked && styles.skillToggleChipActive]}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.skillEmoji}>{skill.icon}</Text>
                      <Text style={[styles.skillToggleText, isChecked && styles.skillToggleTextActive]}>
                        {skill.name}
                      </Text>
                      <View style={[styles.checkCircle, isChecked && styles.checkCircleActive]}>
                        {isChecked && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Sticky Save Bar */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 8, 16) }]}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <ShieldCheck size={18} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>
                  {lang === 'hi' ? `हुनर सुरक्षित करें (${selectedSkills.length} चयनित) ✓` : `Save Skills (${selectedSkills.length} Selected) ✓`}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  topBarCenter: {
    flex: 1,
    marginLeft: 12,
  },
  topBarTitle: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: '#0F172A',
  },
  topBarSubtitle: {
    fontSize: 11,
    fontFamily: 'Satoshi-Regular',
    color: '#64748B',
    marginTop: 1,
  },
  topBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  topBadgeText: {
    fontSize: 11,
    fontFamily: 'Satoshi-Bold',
    color: '#15803D',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  activeTrayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  trayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  trayIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trayTitle: {
    fontSize: 13,
    fontFamily: 'Satoshi-Bold',
    color: '#0F172A',
  },
  emptyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emptyNoticeText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#991B1B',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeSkillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#166534',
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 7,
    borderRadius: 20,
  },
  activeSkillText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
    color: '#FFFFFF',
  },
  removeChipBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderWrap: {
    marginTop: 6,
    marginBottom: 2,
  },
  sectionHeading: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    color: '#0F172A',
  },
  sectionSubHeading: {
    fontSize: 11,
    fontFamily: 'Satoshi-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryTitle: {
    fontSize: 13,
    fontFamily: 'Satoshi-Bold',
    color: '#1E293B',
  },
  skillToggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  skillToggleChipActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
  },
  skillEmoji: {
    fontSize: 14,
  },
  skillToggleText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#334155',
  },
  skillToggleTextActive: {
    fontFamily: 'Satoshi-Bold',
    color: '#166534',
  },
  checkCircle: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  checkCircleActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    color: '#FFFFFF',
  },
});
