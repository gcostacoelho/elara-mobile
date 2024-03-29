import { StyleSheet } from 'react-native';

export const style = StyleSheet.create({
    rowView: {
        marginLeft: 20,
        flexDirection:'row',
        justifyContent: 'space-between',
    },

    space: {
        flexDirection:'row',
        width: '5%', 
    },

    rowView2: {
        flexDirection:'row',
        justifyContent: 'space-between',
    },

    colView: {
        flexDirection:'column',
        justifyContent: 'space-between',
    },

    labeltext: {
        color: '#ffffff',
        marginTop: 5,
        marginBottom: 5,
        fontSize: 18,
    },

    labelTextSub: {
        color: '#ffffff',
        marginBottom: 5,
        fontSize: 15,
    },

    icon: {
        marginTop: '10%',
    },

    hr:{
        borderBottomColor: 'white',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
})