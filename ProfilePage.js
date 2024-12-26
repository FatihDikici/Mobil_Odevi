import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  const userTc = useSelector((state) => state.user.tc);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('tc', '==', userTc));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          setUserData({ id: userDoc.id, ...userDoc.data() });
        } else {
          console.log('Kullanıcı bulunamadı.');
        }
      } catch (error) {
        console.error('Kullanıcı verisi çekme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userTc]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#d01a1a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userData ? (
        <>
          {/* Profil Fotoğrafı ve Kullanıcı Bilgileri */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-circle-outline" size={150} color="#555" />
            </View>
            <Text style={styles.profileName}>{userData.name}</Text>
            <Text style={styles.profileDob}>
              {new Date(userData.dob).toLocaleDateString('tr-TR')}
            </Text>
          </View>

          {/* Kişisel Bilgiler */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>

            {/* TC Bilgisi */}
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={24} color="#555" />
              <Text style={styles.infoLabel}>TC Kimlik No:</Text>
              <Text style={styles.infoValue}>{userData.tc}</Text>
            </View>

            {/* E-posta Bilgisi */}
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={24} color="#555" />
              <Text style={styles.infoLabel}>E-posta:</Text>
              <Text style={styles.infoValue}>{userData.email}</Text>
            </View>
          </View>
        </>
      ) : (
        <Text style={styles.errorText}>Kullanıcı bilgileri bulunamadı.</Text>
      )}
    </View>
  );
};

export default ProfilePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileDob: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  infoSection: {
    backgroundColor: '#f2f4f7',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    flex: 1,
    marginLeft: 10,
  },
 
});