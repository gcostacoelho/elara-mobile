import { THEME } from "../../Themes";
import { StyleSheet } from 'react-native';

export const style = StyleSheet.create({
    divLogin: {
        flexDirection: 'column',
        width: 300,
        height: 270,
        padding: 20,
        margin: 10,
        borderRadius: 7,
        backgroundColor: THEME.COLORS.MODAL_COLOR,
    },

    labelSenha: {
        color: THEME.COLORS.TEXT,
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'right',
        fontSize: 12,
    },

    label: {
        color: THEME.COLORS.TEXT,
        fontSize: 30,
        textAlign: 'center',
        marginBottom: 20,
    },

    text: {
        color: THEME.COLORS.TEXT,
        textAlign: 'center',
    },

    actionText: {
        color: THEME.COLORS.TEXT_LINK,
        textAlign: 'center',
    },

    button: {
        marginTop: 20,
        alignSelf: 'center',
        alignItems: 'center',
        width: 100,
        height: 40,
        backgroundColor: THEME.COLORS.BUTTON_COLOR_LINK,
        borderRadius: 7,
    },

    textButton: {
        marginTop: 6,
        color: THEME.COLORS.TEXT,
        fontSize: 18,
    },


})