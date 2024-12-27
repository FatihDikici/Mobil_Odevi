import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TextInput } from 'react-native';
import { db } from '../../firebaseConfig';
import { getDocs, collection } from 'firebase/firestore';

const FastLabPage = () => {
  // Her test için ayrı state
  const [dob, setDob] = useState('');       // Doğum tarihi (YYYY-MM-DD formatında)
  const [iga, setIga] = useState('');
  const [igm, setIgm] = useState('');
  const [igg, setIgg] = useState('');
  const [igg1, setIgg1] = useState('');
  const [igg2, setIgg2] = useState('');
  const [igg3, setIgg3] = useState('');
  const [igg4, setIgg4] = useState('');
  const [message, setMessage] = useState('');
  const [results, setResults] = useState([]);

  // Değerin normal / yüksek / düşük olarak dönmesini sağlayan fonksiyon
  const compareValue = (value, min, max) => {
    if (value === null || value === undefined || min === undefined || max === undefined) {
      return { status: 'Veri Mevcut Değil', color: 'gray', symbol: '↔' };
    }
    if (isNaN(value) || isNaN(min) || isNaN(max)) {
      return { status: 'Geçersiz Değer', color: 'gray', symbol: '↔' };
    }
    if (value < min) {
      return { status: 'Düşük', color: 'green', symbol: '↓' };
    }
    if (value > max) {
      return { status: 'Yüksek', color: 'red', symbol: '↑' };
    }
    return { status: 'Normal', color: 'blue', symbol: '↔' };
  };

  // doğum tarihinden bugünkü tarihe kadar kaç ay geçtiğini hesaplayan fonksiyon
  const calculateMonths = (birthDateString) => {
    const currentDate = new Date();
    const birthDate = new Date(birthDateString); // girilen string, YYYY-MM-DD formatında olmalı
    if (isNaN(birthDate.getTime())) {
      return -1; // Geçersiz date
    }
    let months =
      (currentDate.getFullYear() - birthDate.getFullYear()) * 12 +
      (currentDate.getMonth() - birthDate.getMonth());

    // Eğer gün bazında henüz dolmamışsa ayı 1 azalt
    if (currentDate.getDate() < birthDate.getDate()) {
      months--;
    }
    return months;
  };

  // guides koleksiyonundan verileri çekmek için fonksiyon
  const fetchGuides = async (
    numericIga,
    numericIgm,
    numericIgg,
    numericIgg1,
    numericIgg2,
    numericIgg3,
    numericIgg4,
    months
  ) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'guides'));
      if (querySnapshot.empty) {
        console.log('Firestore: guides collection is empty');
        return [];
      }

      const guides = [];
      for (const docSnapshot of querySnapshot.docs) {
        const guideData = docSnapshot.data();
        const tests = [];

        // guide içindeki testler (ör: IgA, IgM vb.)
        const testSnapshot = await getDocs(collection(docSnapshot.ref, 'tests'));
        for (const testDoc of testSnapshot.docs) {
          const testData = testDoc.data(); // { name: "IgA", ... }
          const ageGroups = [];

          // Her test için ageGroups alt koleksiyonunu çek
          const ageGroupSnapshot = await getDocs(collection(testDoc.ref, 'ageGroups'));
          for (const ageGroupDoc of ageGroupSnapshot.docs) {
            const ageGroupData = ageGroupDoc.data();
            
            // Örnek: '0-12', '13-24' vb. ageRange formatı
            const [minAge, maxAge] = ageGroupData.ageRange.split('-').map(Number);

            if (months >= minAge && months <= maxAge) {
              // minValue, maxValue gibi alanları çekiyoruz
              const minVal = ageGroupData.minValue;
              const maxVal = ageGroupData.maxValue;

              // Hangi testse ona göre ilgili değeri compareValue ile kıyasla
              let result = null;
              switch (testData.name) {
                case 'IgA':
                  result = compareValue(numericIga, minVal, maxVal);
                  break;
                case 'IgM':
                  result = compareValue(numericIgm, minVal, maxVal);
                  break;
                case 'IgG':
                  result = compareValue(numericIgg, minVal, maxVal);
                  break;
                case 'IgG1':
                  result = compareValue(numericIgg1, minVal, maxVal);
                  break;
                case 'IgG2':
                  result = compareValue(numericIgg2, minVal, maxVal);
                  break;
                case 'IgG3':
                  result = compareValue(numericIgg3, minVal, maxVal);
                  break;
                case 'IgG4':
                  result = compareValue(numericIgg4, minVal, maxVal);
                  break;
                default:
                  // Bu test ismi tanımlı değilse
                  result = { status: 'Tanınmayan Test', color: 'gray', symbol: '↔' };
              }

              // Burada minVal ve maxVal'i de saklıyoruz:
              ageGroups.push({
                ageRange: ageGroupData.ageRange,
                testName: testData.name,
                result,
                minVal,
                maxVal,
              });
            }
          }
          // ageGroups içinde o ay aralığına giren veriler varsa ekle
          if (ageGroups.length > 0) {
            tests.push({ 
              testId: testDoc.id, 
              testName: testData.name, 
              ageGroups 
            });
          }
        }

        if (tests.length > 0) {
          guides.push({ guideId: docSnapshot.id, guideName: guideData.name, tests });
        }
      }
      return guides;
    } catch (error) {
      console.error('Error fetching guides:', error);
      return [];
    }
  };

  const handleEvaluate = async () => {
    // Sadece doğum tarihi boşsa uyar
    if (!dob) {
      setMessage('Lütfen geçerli bir doğum tarihi giriniz.');
      return;
    }

    // Her testi parseFloat ile dönüştür, ancak boş bırakılırsa null olsun
    const numericIga = iga.trim() ? parseFloat(iga) : null;
    const numericIgm = igm.trim() ? parseFloat(igm) : null;
    const numericIgg = igg.trim() ? parseFloat(igg) : null;
    const numericIgg1 = igg1.trim() ? parseFloat(igg1) : null;
    const numericIgg2 = igg2.trim() ? parseFloat(igg2) : null;
    const numericIgg3 = igg3.trim() ? parseFloat(igg3) : null;
    const numericIgg4 = igg4.trim() ? parseFloat(igg4) : null;

    // Doğum tarihinden kaç aylık olduğunu hesapla
    const months = calculateMonths(dob);
    if (months < 0) {
      setMessage('Geçersiz doğum tarihi girdiniz!');
      return;
    }

    try {
      // Firestore guides koleksiyonundan verileri çek
      const allGuides = await fetchGuides(
        numericIga,
        numericIgm,
        numericIgg,
        numericIgg1,
        numericIgg2,
        numericIgg3,
        numericIgg4,
        months
      );

      // Ekrana göstereceğimiz verileri toparlayalım
      // allGuides => [{ guideName, tests: [{ testName, ageGroups: [{ ageRange, result, minVal, maxVal }] }] }]
      let evaluationResults = [];
      allGuides.forEach((guide) => {
        const testsForGuide = [];
        guide.tests.forEach((t) => {
          // ageGroups içerisinde 1 veya daha fazla eleman olabilir
          t.ageGroups.forEach((ag) => {
            testsForGuide.push({
              testName: ag.testName,
              ageRange: ag.ageRange,
              status: ag.result,
              minVal: ag.minVal,
              maxVal: ag.maxVal,
            });
          });
        });
        if (testsForGuide.length > 0) {
          evaluationResults.push({
            guideName: guide.guideName,
            tests: testsForGuide,
          });
        }
      });

      setResults(evaluationResults);
      setMessage(`Hastanın yaşı: ${months} aylık. Değerlendirme tamamlandı!`);
    } catch (err) {
      console.error(err);
      setMessage('Bir hata oluştu.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>FastLabPage</Text>

      <Text style={styles.label}>Doğum Tarihi (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        placeholder="Örn: 2020-05-13"
        value={dob}
        onChangeText={setDob}
      />

      {/* IgA */}
      <Text style={styles.label}>IgA Değeri</Text>
      <TextInput
        style={styles.input}
        placeholder="Örn: 1.2"
        value={iga}
        onChangeText={setIga}
        keyboardType="numbers-and-punctuation"
      />

      {/* IgM */}
      <Text style={styles.label}>IgM Değeri</Text>
      <TextInput
        style={styles.input}
        placeholder="Örn: 0.8"
        value={igm}
        onChangeText={setIgm}
        keyboardType="numbers-and-punctuation"
      />

      {/* IgG */}
      <Text style={styles.label}>IgG Değeri</Text>
      <TextInput
        style={styles.input}
        placeholder="Örn: 7.4"
        value={igg}
        onChangeText={setIgg}
        keyboardType="numbers-and-punctuation"
      />

      {/* IgG1 */}
      <Text style={styles.label}>IgG1 Değeri</Text>
      <TextInput
        style={styles.input}
        placeholder="Örn: 3.5"
        value={igg1}
        onChangeText={setIgg1}
        keyboardType="numbers-and-punctuation"
      />

      {/* IgG2 */}
      <Text style={styles.label}>IgG2 Değeri</Text>
      <TextInput
        style={styles.input}
        placeholder="Örn: 2.1"
        value={igg2}
        onChangeText={setIgg2}
        keyboardType="numbers-and-punctuation"
      />

      {/* IgG3 */}
      <Text style={styles.label}>IgG3 Değeri</Text>
      <TextInput
        style={styles.input}
        placeholder="Örn: 1.1"
        value={igg3}
        onChangeText={setIgg3}
        keyboardType="numbers-and-punctuation"
      />

      {/* IgG4 */}
      <Text style={styles.label}>IgG4 Değeri</Text>
      <TextInput
        style={styles.input}
        placeholder="Örn: 0.5"
        value={igg4}
        onChangeText={setIgg4}
        keyboardType="numbers-and-punctuation"
      />

      <Button title="Değerlendir" onPress={handleEvaluate} />

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {/* Rehber sonuçlarını ekranda gösterelim */}
      {results.length > 0 && (
        <View style={styles.resultContainer}>
          {results.map((guide, idx) => (
            <View key={idx} style={styles.resultCard}>
              <Text style={styles.guideName}>{guide.guideName}</Text>
              {guide.tests.map((testItem, testIdx) => (
                <View key={testIdx} style={styles.testRow}>
                  <Text style={styles.testName}>
                    {/* Test adı ve yaş aralığı */}
                    {testItem.testName} - ({testItem.ageRange} ay aralığı)
                  </Text>

                  {/* Normal/Yüksek/Düşük durumunun gösterimi */}
                  <Text style={{ color: testItem.status.color }}>
                    {testItem.status.symbol} {testItem.status.status}
                  </Text>

                  {/* Referans aralığı bilgisi */}
                  <Text style={styles.referenceRange}>
                    Normal Aralık: {testItem.minVal} - {testItem.maxVal}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};



const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  message: {
    marginTop: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  resultContainer: {
    marginTop: 20,
    width: '100%',
  },
  resultCard: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
  },
  guideName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  testRow: {
    marginTop: 4,
    marginBottom: 10,
  },
  testName: {
    fontWeight: '600',
  },
  referenceRange: {
    fontStyle: 'italic',
    color: '#666',
    marginTop: 2,
  },
});

export default FastLabPage;