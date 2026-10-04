#include <Arduino.h>

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClient.h>

#include <DHTesp.h>
#include <OneWire.h>
#include <DallasTemperature.h>

/*
  ============================================================
  AgroSense - IoT Smart Soil Monitoring System

  ESP32 Simulation - PlatformIO + Wokwi VS Code

  Adjustable Inputs:

  GPIO 32 -> Nitrogen Potentiometer
  GPIO 33 -> Phosphorus Potentiometer
  GPIO 34 -> Potassium Potentiometer
  GPIO 35 -> Soil Moisture Potentiometer

  GPIO 26 -> DS18B20 Soil Temperature
  GPIO 27 -> DHT22 Air Temperature + Humidity

  Fixed Simulation Values:

  Soil pH
  Soil EC

  ============================================================
*/


// ============================================================
// Wi-Fi Configuration
// ============================================================

const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";


// ============================================================
// Device Configuration
// ============================================================
//
// Change this depending on the crop/device you simulate:
//
// AGRO-001 -> Tomato
// AGRO-002 -> Chilli
// AGRO-003 -> Paddy
//
// ============================================================

const char* DEVICE_ID = "AGRO-001";


// ============================================================
// Backend API
// ============================================================
//
// Current Cloudflare Tunnel
//
// IMPORTANT:
// Quick Tunnel URL changes whenever cloudflared is restarted.
// Update this URL when a new tunnel is created.
//
// ============================================================
 const char* API_URL =
"https://abc-def.trycloudflare.com/api/v1/readings";
// ============================================================
// Potentiometer Pins
// ============================================================

#define N_PIN 32
#define P_PIN 33
#define K_PIN 34
#define MOISTURE_PIN 35


// ============================================================
// Digital Sensor Pins
// ============================================================

#define DS18B20_PIN 26
#define DHT_PIN 27


// ============================================================
// Sensor Objects
// ============================================================

DHTesp dhtSensor;

OneWire oneWire(DS18B20_PIN);

DallasTemperature soilTempSensor(&oneWire);


// ============================================================
// Timing
// ============================================================

// Send sensor data every 30 seconds

const unsigned long SENSOR_INTERVAL = 30000;


// Retry HTTP request after 3 seconds

const unsigned long RETRY_DELAY = 3000;


unsigned long previousMillis = 0;


// ============================================================
// Sensor Variables
// ============================================================

float nitrogen = 0.0;
float phosphorus = 0.0;
float potassium = 0.0;

float soilMoisture = 0.0;


// ============================================================
// Fixed Simulation Values
// ============================================================

float soilPH = 6.3;
float soilEC = 1.4;


// ============================================================
// Digital Sensor Values
// ============================================================

float soilTemperature = 0.0;
float airTemperature = 0.0;
float humidity = 0.0;


// ============================================================
// Connect Wi-Fi
// ============================================================

bool connectWiFi() {

  Serial.println();
  Serial.println("Connecting to Wokwi WiFi...");

  WiFi.mode(WIFI_STA);

  WiFi.begin(
    WIFI_SSID,
    WIFI_PASSWORD
  );


  int attempts = 0;


  while (
    WiFi.status() != WL_CONNECTED &&
    attempts < 30
  ) {

    delay(500);

    Serial.print(".");

    attempts++;
  }


  if (WiFi.status() == WL_CONNECTED) {

    Serial.println();

    Serial.println(
      "WiFi connected successfully!"
    );

    Serial.print(
      "ESP32 IP Address: "
    );

    Serial.println(
      WiFi.localIP()
    );

    return true;
  }


  Serial.println();

  Serial.println(
    "WiFi connection failed!"
  );

  return false;
}


// ============================================================
// Read and Map Analog Sensor
// ============================================================

float readMappedSensor(
  int pin,
  float minimum,
  float maximum
) {

  int rawValue =
    analogRead(pin);


  float ratio =
    rawValue / 4095.0f;


  float mappedValue =
    minimum +
    ratio *
    (maximum - minimum);


  return mappedValue;
}


// ============================================================
// Read All Sensors
// ============================================================

void readSensors() {

  // ==========================================================
  // Nitrogen
  // Simulation Range: 0 - 100 mg/kg
  // ==========================================================

  nitrogen =
    readMappedSensor(
      N_PIN,
      0.0,
      100.0
    );


  // ==========================================================
  // Phosphorus
  // Simulation Range: 0 - 100 mg/kg
  // ==========================================================

  phosphorus =
    readMappedSensor(
      P_PIN,
      0.0,
      100.0
    );


  // ==========================================================
  // Potassium
  // Simulation Range: 0 - 250 mg/kg
  // ==========================================================

  potassium =
    readMappedSensor(
      K_PIN,
      0.0,
      250.0
    );


  // ==========================================================
  // Soil Moisture
  // Simulation Range: 0 - 100 %
  // ==========================================================

  soilMoisture =
    readMappedSensor(
      MOISTURE_PIN,
      0.0,
      100.0
    );


  // ==========================================================
  // DS18B20 - Soil Temperature
  // ==========================================================

  soilTempSensor.requestTemperatures();


  float newSoilTemperature =
    soilTempSensor.getTempCByIndex(0);


  if (
    newSoilTemperature !=
    DEVICE_DISCONNECTED_C
  ) {

    soilTemperature =
      newSoilTemperature;

  } else {

    Serial.println(
      "WARNING: DS18B20 reading failed!"
    );
  }


  // ==========================================================
  // DHT22 - Air Temperature + Humidity
  // ==========================================================

  TempAndHumidity dhtData =
    dhtSensor.getTempAndHumidity();


  if (!isnan(dhtData.temperature)) {

    airTemperature =
      dhtData.temperature;

  } else {

    Serial.println(
      "WARNING: DHT22 temperature reading failed!"
    );
  }


  if (!isnan(dhtData.humidity)) {

    humidity =
      dhtData.humidity;

  } else {

    Serial.println(
      "WARNING: DHT22 humidity reading failed!"
    );
  }
}


// ============================================================
// Print Sensor Data
// ============================================================

void printSensorData() {

  Serial.println();

  Serial.println(
    "========================================"
  );

  Serial.println(
    "       AgroSense Sensor Reading"
  );

  Serial.println(
    "========================================"
  );


  Serial.print(
    "Device ID        : "
  );

  Serial.println(
    DEVICE_ID
  );


  Serial.println(
    "----------------------------------------"
  );


  Serial.print(
    "Nitrogen         : "
  );

  Serial.print(
    nitrogen,
    2
  );

  Serial.println(
    " mg/kg"
  );


  Serial.print(
    "Phosphorus       : "
  );

  Serial.print(
    phosphorus,
    2
  );

  Serial.println(
    " mg/kg"
  );


  Serial.print(
    "Potassium        : "
  );

  Serial.print(
    potassium,
    2
  );

  Serial.println(
    " mg/kg"
  );


  Serial.print(
    "Soil pH          : "
  );

  Serial.println(
    soilPH,
    2
  );


  Serial.print(
    "Soil EC          : "
  );

  Serial.print(
    soilEC,
    2
  );

  Serial.println(
    " mS/cm"
  );


  Serial.print(
    "Soil Moisture    : "
  );

  Serial.print(
    soilMoisture,
    2
  );

  Serial.println(
    " %"
  );


  Serial.print(
    "Soil Temperature : "
  );

  Serial.print(
    soilTemperature,
    2
  );

  Serial.println(
    " C"
  );


  Serial.print(
    "Air Temperature  : "
  );

  Serial.print(
    airTemperature,
    2
  );

  Serial.println(
    " C"
  );


  Serial.print(
    "Humidity         : "
  );

  Serial.print(
    humidity,
    2
  );

  Serial.println(
    " %"
  );


  Serial.println(
    "========================================"
  );
}


// ============================================================
// Create JSON Payload
// ============================================================

String createJsonPayload() {

  String payload = "{";


  payload +=
    "\"deviceId\":\"" +
    String(DEVICE_ID) +
    "\",";


  payload +=
    "\"nitrogen\":" +
    String(nitrogen, 2) +
    ",";


  payload +=
    "\"phosphorus\":" +
    String(phosphorus, 2) +
    ",";


  payload +=
    "\"potassium\":" +
    String(potassium, 2) +
    ",";


  payload +=
    "\"ph\":" +
    String(soilPH, 2) +
    ",";


  payload +=
    "\"ec\":" +
    String(soilEC, 2) +
    ",";


  payload +=
    "\"soilMoisture\":" +
    String(soilMoisture, 2) +
    ",";


  payload +=
    "\"soilTemperature\":" +
    String(soilTemperature, 2) +
    ",";


  payload +=
    "\"airTemperature\":" +
    String(airTemperature, 2) +
    ",";


  payload +=
    "\"humidity\":" +
    String(humidity, 2);


  payload += "}";


  return payload;
}


// ============================================================
// Perform HTTP POST
// ============================================================

int performHttpPost(
  const String& jsonPayload
) {

  WiFiClient client;


  HTTPClient http;


  bool started =
    http.begin(
      client,
      API_URL
    );


  if (!started) {

    Serial.println(
      "ERROR: Failed to initialize HTTPS!"
    );

    return -100;
  }


  http.addHeader(
    "Content-Type",
    "application/json"
  );


  http.setTimeout(
    10000
  );


  int responseCode =
    http.POST(
      jsonPayload
    );


  Serial.print(
    "HTTP Response Code: "
  );

  Serial.println(
    responseCode
  );


  if (responseCode > 0) {

    String response =
      http.getString();


    Serial.println();

    Serial.println(
      "Backend Response:"
    );


    Serial.println(
      response
    );

  } else {

    Serial.println();

    Serial.print(
      "HTTP Error: "
    );

    Serial.println(
      http.errorToString(
        responseCode
      )
    );
  }


  http.end();


  return responseCode;
}


// ============================================================
// Send Sensor Data
// ============================================================

void sendSensorData() {

  // ==========================================================
  // Check Wi-Fi
  // ==========================================================

  if (
    WiFi.status() !=
    WL_CONNECTED
  ) {

    Serial.println(
      "WiFi disconnected!"
    );


    if (!connectWiFi()) {

      Serial.println(
        "Cannot send sensor data."
      );

      return;
    }
  }


  // ==========================================================
  // Read Sensors
  // ==========================================================

  readSensors();


  // ==========================================================
  // Display Sensor Values
  // ==========================================================

  printSensorData();


  // ==========================================================
  // Generate JSON
  // ==========================================================

  String jsonPayload =
    createJsonPayload();


  Serial.println();

  Serial.println(
    "Sending sensor data to backend..."
  );


  Serial.println(
    "----------------------------------------"
  );


  Serial.println(
    jsonPayload
  );


  Serial.println(
    "----------------------------------------"
  );


  // ==========================================================
  // HTTP POST Attempt 1
  // ==========================================================

  Serial.println(
    "HTTP POST Attempt 1"
  );


  int responseCode =
    performHttpPost(
      jsonPayload
    );


  // ==========================================================
  // Success
  // ==========================================================

  if (responseCode == 201) {

    Serial.println();

    Serial.println(
      "SUCCESS: Sensor data stored in MongoDB!"
    );
  }


  // ==========================================================
  // Retry Connection Failure
  // ==========================================================

  else if (responseCode <= 0) {

    Serial.println();

    Serial.println(
      "First request failed."
    );


    Serial.println(
      "Retrying in 3 seconds..."
    );


    delay(
      RETRY_DELAY
    );


    if (
      WiFi.status() !=
      WL_CONNECTED
    ) {

      connectWiFi();
    }


    Serial.println();

    Serial.println(
      "HTTP POST Attempt 2"
    );


    responseCode =
      performHttpPost(
        jsonPayload
      );


    if (responseCode == 201) {

      Serial.println();

      Serial.println(
        "SUCCESS: Retry worked!"
      );


      Serial.println(
        "Sensor data stored in MongoDB!"
      );

    } else {

      Serial.println();

      Serial.println(
        "ERROR: Sensor data could not be sent."
      );
    }
  }


  // ==========================================================
  // Backend Error
  // ==========================================================

  else {

    Serial.println();

    Serial.print(
      "Backend returned status: "
    );

    Serial.println(
      responseCode
    );
  }


  Serial.println();

  Serial.println(
    "========================================"
  );

  Serial.println(
    "Waiting 30 seconds for next reading..."
  );

  Serial.println(
    "========================================"
  );
}


// ============================================================
// Setup
// ============================================================

void setup() {

  Serial.begin(
    115200
  );


  delay(
    1000
  );


  Serial.println();

  Serial.println(
    "========================================"
  );

  Serial.println(
    " AgroSense IoT Soil Monitoring System"
  );

  Serial.println(
    " PlatformIO + Wokwi VS Code"
  );


  Serial.print(
    " Device ID: "
  );

  Serial.println(
    DEVICE_ID
  );


  Serial.println(
    "========================================"
  );


  // ==========================================================
  // ADC
  // ==========================================================

  analogReadResolution(
    12
  );


  // ==========================================================
  // Potentiometers
  // ==========================================================

  pinMode(
    N_PIN,
    INPUT
  );


  pinMode(
    P_PIN,
    INPUT
  );


  pinMode(
    K_PIN,
    INPUT
  );


  pinMode(
    MOISTURE_PIN,
    INPUT
  );


  // ==========================================================
  // Initialize DHT22
  // ==========================================================

  dhtSensor.setup(
    DHT_PIN,
    DHTesp::DHT22
  );


  // ==========================================================
  // Initialize DS18B20
  // ==========================================================

  soilTempSensor.begin();


  Serial.println(
    "DHT22 initialized."
  );


  Serial.println(
    "DS18B20 initialized."
  );


  // ==========================================================
  // Wi-Fi
  // ==========================================================

  connectWiFi();


  // Give sensors startup time

  delay(
    2000
  );


  // ==========================================================
  // Send First Reading Immediately
  // ==========================================================

  if (
    WiFi.status() ==
    WL_CONNECTED
  ) {

    sendSensorData();
  }


  previousMillis =
    millis();
}


// ============================================================
// Main Loop
// ============================================================

void loop() {

  unsigned long currentMillis =
    millis();


  if (
    currentMillis -
    previousMillis >=
    SENSOR_INTERVAL
  ) {

    previousMillis =
      currentMillis;


    sendSensorData();
  }


  delay(
    50
  );
}