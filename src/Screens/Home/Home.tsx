import axios from "axios";
import * as FileSystem from "expo-file-system";
import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Pressable,
  FlatList,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Icon } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import { style } from "./style";

import { CardsList } from "../../Components/CardsList/CardsList";
import { PlanetImage } from "../../Components/Image";

import helpers from "../../assets/helpers.json";

import { inputTypeAnalysis } from "../../utils/inputAnalysis";
import { weatherRequest } from "../../services/Requests/weatherRequest";
import {
  videoRequest,
  webRequest,
} from "../../services/Requests/searchRequest";
import { chooseRequestEndpoint } from "../../services/Requests/toDoListRequest";
import { SpeakModule } from "../../services/Voice/SpeakModule";
import { openApplication } from "../../services/Requests/openRequest";
import { getData } from "../../services/Storage/getData";
import { convertDateToString } from "../../utils/convertDate";
import { Cards } from "../../Components/Card/Card";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import { BackgroundWithoutPlanet } from "../../Components/BackgroundWithoutPlanet/BackgroundWithoutPlanet";
import * as NavigationBar from 'expo-navigation-bar';
import { SafeAreaProvider } from "react-native-safe-area-context";

interface Card {
  title: string;
  subtitle: string;
}

export function Home() {
  const [cardList, setCardList] = useState<Card[] | undefined>(undefined);
  const [cardHistoric, setCardHistoric] = useState<Card[] | undefined>(
    undefined
  );
  const [card, setCard] = useState<any>(helpers.suggestions);
  const [refreshing, setRefreshing] = useState(true);

  const [componentCard, setComponentCard] = useState<string>("historic");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [activateService, setActivateService] = useState<boolean>(false);
  const [audioTranscribed, setAudioTranscribed] = useState<string | null>(null);
  const nav = useNavigation();

  useEffect(() => {
    Audio.requestPermissionsAsync().then(({ granted }) => {
      if (granted) {
        Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          playThroughEarpieceAndroid: true,
        });
        Audio.RecordingOptionsPresets.HIGH_QUALITY = {
          isMeteringEnabled: true,
          android: {
            extension: ".mp3",
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: ".mp3",
            outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
            audioQuality: Audio.IOSAudioQuality.MAX,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            mimeType: "audio/webm",
            bitsPerSecond: 128000,
          },
        };
      }
    });
    NavigationBar.setVisibilityAsync("hidden");
    handleApi();
  }, []);

  useEffect(() => {
    async function requests() {
      const [email, token] = await Promise.all([
        getData("email"),
        getData("access_token"),
      ]);

      if (activateService && audioTranscribed) {
        const intention = inputTypeAnalysis(audioTranscribed);
        let message = undefined;

        switch (intention) {
          case "toDo":
            message = await chooseRequestEndpoint(audioTranscribed);

            console.log("Message - ", message);

            break;
          case "search":
          case "searchVideo":
            if (intention == "search") {
              message = await webRequest(audioTranscribed);
              console.log("Message - ", message);
            } else {
              const { apiMessage, video } = await videoRequest(
                audioTranscribed
              );

              message = apiMessage;

              if (video != null) {
                console.log("Message - ", apiMessage);
                Linking.openURL(video);
              }
            }

            break;

          case "open":
            const { openMessage, urlApp } = await openApplication(
              audioTranscribed
            );

            message = openMessage;

            if (urlApp != null) {
              console.log("Message IF- ", message);

              Linking.openURL(urlApp);
            }

            break;

          case "weather":
            message = await weatherRequest(audioTranscribed.replace('"', ""));
            console.log("Message -", message);

            break;
          default:
            message = "Não entendi a sua solicitação";
            break;
        }

        SpeakModule(message);

        await axios
          .post(
            `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:${process.env.EXPO_PUBLIC_PORT}/historic/${email}`,
            {
              pedido: audioTranscribed,
              resposta: message,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then(() => console.log("Historico salvo"));

        setActivateService(false);
        setAudioTranscribed(null);
      }
    }

    requests();
  });

  async function handleApi() {
    const [email, token] = await Promise.all([
      getData("email"),
      getData("access_token"),
    ]);

    const { data, status } = await axios.get(
      `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:${process.env.EXPO_PUBLIC_PORT}/user/${email}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (status == 200) {
      const cardsList = data.listas.map((el: any) => {
        let sub: string = "Sem data de entrega";

        if (el.dataEntrega != null) {
          sub = `Data de entrega: ${convertDateToString(el.dataEntrega)}`;
        }

        return {
          title: el.nomeLista,
          subtitle: sub,
        };
      });

      const cardHistoric = data.historico.map((el: any) => {
        return {
          title: el.pedido,
          subtitle: el.resposta,
        };
      });

      setCardHistoric(cardHistoric);
      setCardList(cardsList);
      setRefreshing(false);
    }
  }

  async function handleRecordStart() {
    const { granted } = await Audio.getPermissionsAsync();

    if (!granted) {
      console.log("Permissã́o necessária");
      Alert.alert("Conceda a permissã́o do uso do microfone");
      return;
    }

    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleRecordStop() {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const fileUri = recording.getURI();

        setRecording(null);

        if (fileUri !== null) {
          try {
            setActivateService(true);

            const response = await FileSystem.uploadAsync(
              `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/transcript`,
              fileUri,
              {
                fieldName: "file",
                httpMethod: "POST",
                uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
              }
            );

            setAudioTranscribed(response.body);
          } catch (error) {
            console.log(error);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  function setComponentForCards() {
    if (componentCard == "list") {
      return (
        <FlatList
          data={cardList}
          renderItem={({ item }) => (
            <CardsList title={item.title} subTitle={item.subtitle} />
          )}
          ListEmptyComponent={
            <Text
              style={{
                flex: 1,
                textAlign: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              Não há items para exibir
            </Text>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleApi} />
          }
          keyExtractor={(item, index) => index.toString()}
        />
      );
    } else if (componentCard == "historic") {
      return (
        <FlatList
          data={cardHistoric}
          renderItem={({ item }) => (
            <Cards title={item.title} subTitle={item.subtitle} />
          )}
          ListEmptyComponent={
            <Text
              style={{
                flex: 1,
                textAlign: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              Não há items para exibir
            </Text>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleApi} />
          }
          keyExtractor={(item, index) => index.toString()}
        />
      );
    } else {
      return (
        <FlatList
          data={card}
          renderItem={({ item }) => (
            <Cards title={item.title} subTitle={item.subtitle} />
          )}
          ListEmptyComponent={
            <Text
              style={{
                flex: 1,
                textAlign: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              Não há items para exibir
            </Text>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleApi} />
          }
          keyExtractor={(item, index) => index.toString()}
        />
      );
    }
  }

  return (
    <BackgroundWithoutPlanet>
        <View style={style.view}>
          <View style={style.rowView}>
            <Text style={style.label}>Elara</Text>

            <Pressable>
              <Icon
                color="#851397"
                size={40}
                name="settings"
                onPress={() => nav.navigate("configs")}
              />
            </Pressable>
          </View>
          <View style={style.hr} />

          <Pressable
            disabled={activateService}
            style={style.pressable}
            onPressIn={handleRecordStart}
            onPressOut={handleRecordStop}
          >
            <View style={{ opacity: 0.5 }}>
              <PlanetImage />
            </View>

            {activateService == true ? (
              <ActivityIndicator color="#851397" size={80} />
            ) : (
              <Icon
                color="#851397"
                size={80}
                name="microphone"
                type="material-community"
              />
            )}
          </Pressable>

          <View style={style.rowView2}>
            <Pressable>
              <Icon
                color={componentCard == "historic" ? "#851397" : "#ffffff"}
                size={30}
                name="clock-time-three-outline"
                type="material-community"
                onPress={() => setComponentCard("historic")}
              />
            </Pressable>
            <Icon
              color={componentCard == "list" ? "#851397" : "#ffffff"}
              size={40}
              name="list"
              onPress={() => setComponentCard("list")}
            />
            <Pressable>
              <Icon
                color={componentCard == "help" ? "#851397" : "#ffffff"}
                size={30}
                name="help-circle-outline"
                type="material-community"
                onPress={() => setComponentCard("help")}
              />
            </Pressable>
          </View>
          <View style={style.view2}>{setComponentForCards()}</View>
        </View>
    </BackgroundWithoutPlanet>
  );
}
