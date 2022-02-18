export default function getFormatedBidsTime (time: string) {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const monthFormat = (month < 10) ? '0' + month : month;
    const dayFormat = (day < 10) ? '0' + day : day;

    const formatedTime = `${dayFormat}-${monthFormat}-${year}, ${date.toLocaleTimeString()}`

    return formatedTime;
}