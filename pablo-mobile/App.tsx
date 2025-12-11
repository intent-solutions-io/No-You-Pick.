import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { searchRestaurants, Restaurant } from './services/api';

const CUISINES = [
  'Any',
  'Mexican',
  'Italian',
  'Chinese',
  'Japanese',
  'Thai',
  'Indian',
  'American',
  'BBQ',
  'Pizza',
  'Sushi',
  'Burgers',
  'Seafood',
  'Vietnamese',
  'Korean',
  'Mediterranean',
];

export default function App() {
  const [location, setLocation] = useState('');
  const [cuisine, setCuisine] = useState('Any');
  const [radius, setRadius] = useState('10');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCuisines, setShowCuisines] = useState(false);

  const handleSearch = async () => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError('');
    setRestaurants([]);

    try {
      const result = await searchRestaurants(location, cuisine, radius);
      setRestaurants(result.restaurants);
      if (result.restaurants.length === 0) {
        setError('No restaurants found. Try a different location or cuisine.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openMaps = (restaurant: Restaurant) => {
    if (restaurant.googleMapLink) {
      Linking.openURL(restaurant.googleMapLink);
    }
  };

  const spinAgain = () => {
    const excludeNames = restaurants.map(r => r.name);
    setLoading(true);
    setError('');

    searchRestaurants(location, cuisine, radius, excludeNames)
      .then(result => {
        setRestaurants(result.restaurants);
        if (result.restaurants.length === 0) {
          setError('No more restaurants found!');
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🦊 No, YOU Pick!</Text>
          <Text style={styles.subtitle}>AI-Powered Restaurant Picker</Text>
        </View>

        {/* Search Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Where are you?</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter city, address, or zip code"
            placeholderTextColor="#999"
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>What are you craving?</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowCuisines(!showCuisines)}
          >
            <Text style={styles.dropdownText}>{cuisine}</Text>
            <Text style={styles.dropdownArrow}>{showCuisines ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showCuisines && (
            <View style={styles.cuisineList}>
              {CUISINES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.cuisineItem,
                    cuisine === c && styles.cuisineItemSelected,
                  ]}
                  onPress={() => {
                    setCuisine(c);
                    setShowCuisines(false);
                  }}
                >
                  <Text
                    style={[
                      styles.cuisineText,
                      cuisine === c && styles.cuisineTextSelected,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Search radius: {radius} miles</Text>
          <View style={styles.radiusButtons}>
            {['5', '10', '15', '25'].map(r => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.radiusButton,
                  radius === r && styles.radiusButtonSelected,
                ]}
                onPress={() => setRadius(r)}
              >
                <Text
                  style={[
                    styles.radiusText,
                    radius === r && styles.radiusTextSelected,
                  ]}
                >
                  {r}mi
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Main Search Button */}
          <TouchableOpacity
            style={[styles.searchButton, loading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.searchButtonText}>🎲 No, YOU Pick!</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Results */}
        {restaurants.length > 0 && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>Your Picks:</Text>

            {restaurants.map((restaurant, index) => (
              <TouchableOpacity
                key={restaurant.id}
                style={styles.card}
                onPress={() => openMaps(restaurant)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardNumber}>#{index + 1}</Text>
                  <Text style={styles.cardName}>{restaurant.name}</Text>
                </View>
                <View style={styles.cardDetails}>
                  <Text style={styles.cardCuisine}>🍽️ {restaurant.cuisine}</Text>
                  <Text style={styles.cardRating}>⭐ {restaurant.rating}</Text>
                  <Text style={styles.cardStatus}>
                    {restaurant.openStatus === 'Open' ? '🟢' : '🔴'}{' '}
                    {restaurant.openStatus}
                  </Text>
                </View>
                <Text style={styles.cardAddress}>📍 {restaurant.address}</Text>
                <Text style={styles.cardReason}>💡 {restaurant.reason}</Text>
                <Text style={styles.cardTap}>Tap to open in Maps →</Text>
              </TouchableOpacity>
            ))}

            {/* Spin Again Button */}
            <TouchableOpacity
              style={styles.spinButton}
              onPress={spinAgain}
              disabled={loading}
            >
              <Text style={styles.spinButtonText}>🔄 Spin Again!</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>Powered by Gemini AI</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  form: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  dropdown: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownArrow: {
    color: '#e94560',
    fontSize: 14,
  },
  cuisineList: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    marginBottom: 20,
    maxHeight: 200,
  },
  cuisineItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  cuisineItemSelected: {
    backgroundColor: '#e94560',
  },
  cuisineText: {
    color: '#fff',
    fontSize: 15,
  },
  cuisineTextSelected: {
    fontWeight: 'bold',
  },
  radiusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  radiusButton: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  radiusButtonSelected: {
    backgroundColor: '#e94560',
  },
  radiusText: {
    color: '#fff',
    fontSize: 14,
  },
  radiusTextSelected: {
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.7,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
  },
  results: {
    marginTop: 10,
  },
  resultsTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#e94560',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardNumber: {
    backgroundColor: '#e94560',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  cardName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  cardDetails: {
    flexDirection: 'row',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  cardCuisine: {
    color: '#aaa',
    marginRight: 16,
    fontSize: 14,
  },
  cardRating: {
    color: '#ffd700',
    marginRight: 16,
    fontSize: 14,
  },
  cardStatus: {
    color: '#aaa',
    fontSize: 14,
  },
  cardAddress: {
    color: '#888',
    marginBottom: 8,
    fontSize: 14,
  },
  cardReason: {
    color: '#4ecca3',
    fontStyle: 'italic',
    marginBottom: 10,
    fontSize: 14,
  },
  cardTap: {
    color: '#e94560',
    fontSize: 12,
    textAlign: 'right',
  },
  spinButton: {
    backgroundColor: '#4ecca3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  spinButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    color: '#555',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 12,
  },
});
