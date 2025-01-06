#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <LiquidCrystal_I2C.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"

// ------ CONFIGURAZIONI E VARIABILI ------

// Configurazione Wi-Fi
const char* ssid = "Chihiro Fushimi";          // Sostituisci con il nome della tua rete Wi-Fi
const char* password = "giuv1911";            // Sostituisci con la password della tua rete Wi-Fi

// Configurazione IP statico
IPAddress local_IP(192, 168, 197, 89);    // IP statico desiderato
IPAddress gateway(192, 168, 1, 1);      // Gateway della rete
IPAddress subnet(255, 255, 255, 0);     // Subnet mask
IPAddress primaryDNS(8, 8, 8, 8);       // Server DNS primario


// Numero totale di posti disponibili
#define POSTI_TOTALI 10
int posti_liberi = POSTI_TOTALI;


//Semaforo, utile per lo  Strict2PL implementato nella transazione
SemaphoreHandle_t xMutex;


String ip_addresses[4] = {"192.168.197.63","192.168.197.154","192.168.197.173","192.168.197.101"}; //address IP

// Variabili per il controllo del LED
String ledState = "OFF";
//const int LED_BUILTIN = 2; // Pin del LED integrato sulla ESP32

// Oggetto LCD
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Server HTTP su porta 80
WebServer server(80);

String randNumberReq; //Numero randomico

// ------ FUNZIONI ------

// Inizializza lo schermo LCD
void initLCD() {
  lcd.init();
  lcd.backlight();
  
}

// Aggiorna lo schermo LCD con i posti disponibili
void aggiornaLCD() {
  lcd.clear();
  if (posti_liberi > 0) {
    lcd.setCursor(0, 0);
    lcd.print("Posti liberi:");
    lcd.setCursor(0, 1);
    lcd.print(posti_liberi);
  } else {
    lcd.setCursor(0, 0);
    lcd.print("Posti finiti!");
  }
}




void Task1(void *body){


  String* bodymes = (String*) body;


  // Parsing del payload JSON
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, *(bodymes));

  if (error) {
    Serial.println("Errore nel parsing del JSON");
    server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
    return;
  }

  
  if(xSemaphoreTake(xMutex, portMAX_DELAY) == pdTRUE){ //Acquire mutex

    Serial.println("Task sta accedendo alla risorsa condivisa.");

    //int ack = checkMessagePosti(doc);    //facciamo check di ingresso o uscita


    int x = doc["x"]; // x=1 per ingresso, x=ù0 per uscita


    if (x == 1) { // Ingresso
      if (posti_liberi > 0) {
        posti_liberi--;
        Serial.println("Ingresso consentito. Posti liberi: " + String(posti_liberi));
      } else {
        Serial.println("Posti esauriti. Ingresso negato.");
      }
    } else if (x == 0) { // Uscita
      if (posti_liberi < POSTI_TOTALI) {
        posti_liberi++;
        Serial.println("Uscita consentita. Posti liberi: " + String(posti_liberi));
      } else {
        Serial.println("Nessuna macchina in uscita. Uscita negata.");
      }

    }


    xSemaphoreGive(xMutex); //Release
  }

  vTaskDelete(NULL); //Eliminazione Task, come se fosse un commit.

}


// Route per gestire richieste POST per Ingresso/Uscita
void handlePost() {
  if (server.hasArg("plain") == false) {
    server.send(400, "application/json", "{\"error\":\"Bad Request\"}");
    return;
  }

  String body = server.arg("plain");
  Serial.println("Richiesta ricevuta: " + body);

  BaseType_t xReturned = xTaskCreate(Task1, "Task1", 20000, (void*) &body, 1, NULL); //Creazione del Task 

  StaticJsonDocument<100> response;
  String responseBody;
  if( xReturned == pdPASS ){

    aggiornaLCD();
  
    response["ack"] = 1;
    serializeJson(response, responseBody);
    

   
  } else {
    response["ack"] = 0;
    serializeJson(response, responseBody);
  }

  server.send(200, "application/json", responseBody);

}

//Getsione richiesta GET di posti_liberi
void handlePlaces(){
  server.send(200, "text", String(posti_liberi));
}


void Task2(void *body){

  String * bodymes = (String*) body;

  // Creare un buffer per analizzare il JSON 
  const size_t capacity = JSON_OBJECT_SIZE(2) + 40; 
  DynamicJsonDocument doc(capacity); //Crea un DynamicJsonDocument con la capacità del Buffer creato
  
  // Analizzare il JSON 
  DeserializationError error = deserializeJson(doc, *(bodymes));  //Deserializza il json


  if (error) { 
    Serial.print(F("Errore di deserializzazione JSON: ")); 
    Serial.println(error.f_str()); server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}"); 
    return; 
  } 
  
  if(xSemaphoreTake(xMutex, portMAX_DELAY) == pdTRUE){
    // Ottieni il valore del campo "posti" 
    int num_posti = int(doc["posti"]); 
     
    posti_liberi = num_posti;
    
    
    xSemaphoreGive(xMutex); //Release
  }

  vTaskDelete(NULL); //Eliminazione Task, come se fosse un commit.

}

void handleChangePlaces(){
  //mi prendo il nuovo numero di posti dal payload della risposta
  String body = server.arg("plain");
  Serial.println("Richiesta ricevuta: " + body);


  // Creare un buffer per analizzare il JSON 
  const size_t capacity = JSON_OBJECT_SIZE(2) + 40; 
  DynamicJsonDocument doc(capacity); //Crea un DynamicJsonDocument con la capacità del Buffer creato
  
  // Analizzare il JSON 
  DeserializationError error = deserializeJson(doc, body);  //Deserializza il json


  String randNumb = doc["random"];
  Serial.println(randNumb);
  Serial.println(randNumberReq);

  if (randNumb.compareTo(randNumberReq) == 0){
  BaseType_t xReturned = xTaskCreate(Task2, "Task2", 20000, (void*) &body, 1, NULL); //Creazione del Task 


    if( xReturned == pdPASS ){
      aggiornaLCD();
      server.send(201,"","");
    } else {
      server.send(500, "", "");
    }

  } else {
    server.send(401, "", "");
  }

  randNumberReq="";
}


void handleOptions(){ 
  server.sendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS"); 
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type"); 
  server.send(204); // No Content 
}


//Funzione per la richiesta di un numero casuale, per fare in modo di Autenticare la richiesta di apertura del gate. 
void getKeys(){

  randNumberReq = String(random(30, 10001));
  server.send(200, "text/plain", randNumberReq);
}


void sendGetGates(int id){
    HTTPClient http;
    http.begin("http://"+ip_addresses[id-1]+"/gate");
    int HttpResponseCode = http.GET();
   
    if(HttpResponseCode == 200){
      server.send(200, "", "");
    } else {
      server.send(500, "", "");
    }
    
    randNumberReq="";
    http.end();
}

//Metodo per la gestione della richiesta del metodo "/gates"
void handleGates(){

  //mi prendo il nuovo numero di posti dal payload della risposta
  String body = server.arg("plain");
  Serial.println("Richiesta ricevuta: " + body);

  // Creare un buffer per analizzare il JSON 
  const size_t capacity = JSON_OBJECT_SIZE(2) + 40; 
  DynamicJsonDocument doc(capacity); //Crea un DynamicJsonDocument con la capacità del Buffer creato
  
  // Analizzare il JSON 
  DeserializationError error = deserializeJson(doc, body);  //Deserializza il json

  if (error) { 
    Serial.print(F("Errore di deserializzazione JSON: ")); 
    Serial.println(error.f_str()); server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}"); 
    return; 
  } 

  int id = doc["id"];
  String random = doc["random"];

  
  Serial.println(random);
  Serial.println(randNumberReq);
  Serial.println(id);

  if (random.compareTo(randNumberReq) == 0) {
      Serial.print("Richiesta di apertura...");
      sendGetGates(id); //Chiamata del metodo "/gate" sul client specificato
  } else {
    server.send(401, "", "");
  }

}


// Configura le route del server
void setupServerRoutes() {
  server.enableCORS();
  server.on("/2002200001280929", HTTP_GET, getKeys); //Ritorna il valore casuale
  server.on("/gates", HTTP_POST, handleGates);
  server.on("/places", HTTP_GET, handlePlaces);  //Ritorna i posti disponibili
  server.on("/parking", HTTP_POST, handlePost);  // Gestisce ingressi/uscite parcheggio
  server.on("/change_places", HTTP_POST,handleChangePlaces); //Aggiornamento posti da parte dell'admin
  server.on("/change_places", HTTP_OPTIONS, handleOptions); //Per le richieste di Pre-Flight
  server.begin();
  Serial.println("Server HTTP avviato");
}

// ------ SETUP E LOOP ------



void setup() {
  Serial.begin(115200);
  initLCD();

  lcd.setCursor(0, 0);
  lcd.print("DI.P.S by B&B");
  delay(1000);


  //Creazione semaforo
  xMutex = xSemaphoreCreateMutex(); 

  // Configura l'IP statico
  if (!WiFi.config(local_IP, gateway, subnet, primaryDNS)) {
    Serial.println("Errore nella configurazione dell'IP statico");
  }

  // Configurazione Wi-Fi
  WiFi.begin(ssid, password);
  Serial.println("Connessione alla rete Wi-Fi...");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connessione...");



  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConnesso al Wi-Fi!");
  Serial.print("Indirizzo IP: ");
  Serial.println(WiFi.localIP());

  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Posti liberi:");
  lcd.setCursor(0, 1);
  lcd.print(posti_liberi);

  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);

  // Configura le route del server
  setupServerRoutes();
  randomSeed(analogRead(0)); //Seed per il numero randomico, generato nel metodo "get2002200001280929"
}

void loop() {
  server.handleClient();
}