import envVar from './environment-variables'

const database : { provider: 'postgresql'|'sqlite', url: string} = {
  provider: envVar.database.provider,
  url: envVar.database.url,
}

const session : { secret: string, maxAge: number} = {
  secret: envVar.session.secret,
  maxAge: envVar.session.maxAge,
}

const storage = {
  gcpUrlBase: `https://storage.googleapis.com/${envVar.gcs.bucket}/`,
  webUrlBase: `https://storage.googleapis.com/${envVar.gcs.bucket}/`,
  bucket: envVar.gcs.bucket,
  filename: 'original',
}

const googleCloudStorage = {
  origin: 'https://storage.googleapis.com',
  bucket:  envVar.gcs.bucket,
}

const files = {
  baseUrl: envVar.files.baseUrl,
  storagePath: envVar.files.storagePath,
}

const images = {
  baseUrl: envVar.images.baseUrl,
  storagePath: envVar.images.storagePath,
}

enum Region {
  Global = 'global',
  Taiwan = 'TW',
  Keelung = 'KLU',
  NewTaipei = 'TPH',
  Taipei = 'TPE',
  Taoyuan = 'TYC',
  HsinchuCounty = 'HSH',
  HsinchuCity = 'HSC',
  Miaoli = 'MAL',
  Taichung = 'TXG',
  Nantou = 'NTC',
  Changhua = 'CWH',
  Yunlin = 'YLH',
  ChiayiCounty = 'CHY',
  ChiayiCity = 'CYI',
  Tainan = 'TNN',
  Kaohsiung = 'KHH',
  Pingtung = 'IUH',
  Taitung = 'TTT',
  Hualien = 'HWA',
  Yilan = 'ILN',
  Penghu = 'PEH',
  Kinmen = 'KMN',
  Lienchiang = 'LNN',
  NorthAmerica = 'NAME',
  UK = 'UK',
  Europe = 'EURO',
  NewZealandAustralia = 'NZAU',
  Africa = 'AFR',
  MiddleEast = 'ME',
  LatinAmerica = 'LAME',
  Japan = 'JP',
  Korea = 'KR',
  HongKongMacao = 'HKMO',
  China = 'CH',
  SoutheastAsia = 'SEA',
  SouthAsia = 'SA',
  Others = 'others',
  
}


const region_options = [
{ label: '全球', value: Region.Global},
{ label: '台灣', value: Region.Taiwan },
{ label: '基隆市', value: Region.Keelung },
{ label: '台北市', value: Region.NewTaipei},
{ label: '新北市', value: Region.Taipei },
{ label: '桃園市', value: Region.Taoyuan },
{ label: '新竹市', value: Region.HsinchuCounty },
{ label: '新竹縣', value: Region.HsinchuCity},
{ label: '苗栗縣', value: Region.Miaoli },
{ label: '台中市', value: Region.Taichung },
{ label: '南投縣', value: Region.Nantou },
{ label: '彰化縣', value: Region.Changhua },
{ label: '雲林縣', value: Region.Yunlin },
{ label: '嘉義市', value: Region.ChiayiCity },
{ label: '嘉義縣', value: Region.ChiayiCounty },
{ label: '台南市', value: Region.Tainan },
{ label: '高雄市', value: Region.Kaohsiung },
{ label: '屏東縣', value: Region.Pingtung },
{ label: '台東縣', value: Region.Taitung },
{ label: '花蓮縣', value: Region.Hualien },
{ label: '宜蘭縣', value: Region.Yilan },
{ label: '澎湖縣', value: Region.Penghu },
{ label: '金門縣', value: Region.Kinmen },
{ label: '連江縣', value: Region.Lienchiang },
{ label: '美加', value: Region.NorthAmerica },
{ label: '英國', value: Region.UK },
{ label: '歐洲', value: Region.Europe },
{ label: '紐澳', value: Region.NewZealandAustralia },
{ label: '非洲', value: Region.Africa},
{ label: '中東', value: Region.MiddleEast },
{ label: '中南美', value: Region.LatinAmerica },
{ label: '日本', value: Region.Japan },
{ label: '韓國', value: Region.Korea},
{ label: '港澳', value: Region.HongKongMacao },
{ label: '中國大陸', value: Region.China },
{ label: '東南亞', value: Region.SoutheastAsia },
{ label: '南亞', value: Region.SouthAsia},
{ label: '其他地區', value: Region.Others },
]

export default {
  database,
  session,
  storage,
  googleCloudStorage,
  files,
  images,
  region_options,
}
