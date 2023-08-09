import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from 'react-native-elements'

import { useNavigation } from "@react-navigation/native";
import { style } from "./style";
import { Background } from "../../Components/Background/Background";
import { PlanetImage } from "../../Components/Image";


export function Config() {
    const nav = useNavigation();

    return (
        <Background>
            <SafeAreaView style={style.view}>
                <View>
                    <View style={style.rowView}>
                        <Text style={style.label}>Elara</Text>

                        <Pressable>
                            <Icon color='#851397' name="settings" onPress={() => {}}/>
                        </Pressable>
                    </View>
                    <View style={style.hr}/>

                    <View style={style.body}>

                        <Pressable style={style.pressable} onPress={() => nav.navigate("perfil")}>
                            <Icon color='#851397' name="account" type='material-community'/>
                            <Text style={style.textButton}>Perfil</Text>
                        </Pressable>
                        <View style={style.hr}/>

                        <Pressable style={style.pressable} onPress={() => {}}>
                            <Icon color='#851397' name="lock-outline" type='material-community'/>
                            <Text style={style.textButton}>Permissões</Text>
                        </Pressable>
                        <View style={style.hr}/>

                        <Pressable style={style.pressable} onPress={() => {}}>
                            <Icon color='#851397' name="help" type='material-community'/>
                            <Text style={style.textButton}>Sobre</Text>
                        </Pressable>
                        <View style={style.hr}/>

                    </View>
                    
                </View>
                <View style={{ opacity: 0.5 }}>
                    <PlanetImage />
                </View>
            </SafeAreaView>  
        </Background>
    );
}
