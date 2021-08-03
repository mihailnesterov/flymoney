<?php

// Класс для получения курсов валют с сайта http://www.floatrates.com/

// Подключаем класс с методами для работы с курсами валют
require_once get_stylesheet_directory() . '/classes/class-exchange-bank-methods.php';
// Подключаем интерфейс
require_once get_stylesheet_directory() . '/classes/interface-exchange-bank.php';

class ExchangeFloatRates extends ExchangeBankMethods implements IExchangeBank {

     /**
	 * Get valutes from xml of national bank (abstract method realisation)
	 * Получает массив вылют из xml: http://www.floatrates.com/daily/<...>.xml'
	 * (реализация абстрактного метода из родительского класса)
	 * 
	 * @return	array
	 * @access	public
	 */
    public function get_valutes_from_bank( $new_valutes = array() ) {
    	
    	// берем массив валют из $new_valutes (если он не пуст - добавление) или из include/countries.php (обновление)
		$codes = isset($new_valutes) && !empty($new_valutes) ? $new_valutes : array_keys(require get_stylesheet_directory() . '/include/countries.php');

		$valutes = array(); // массив, в который сохраним данные из xml
		
		foreach( $codes as $country => $code ) {
			// формируем url, в который передаем названия валют (rub, uah, try...)
			$xml_url	= 'http://www.floatrates.com/daily/' . strtolower($code) . '.xml';
			// получаем xml с курсами валюты
			$xml_daily	= json_decode( json_encode( simplexml_load_file( $xml_url ) ), TRUE);

			// перебираем xml
			foreach( $xml_daily['item'] as $key => $value ) {
				// проверка - берем только те валюты, которые перечислены в include/countries.php, 
				// чтобы не хранить неиспользуемые курсы
				if( in_array($value['targetCurrency'], array_keys(require get_stylesheet_directory() . '/include/countries.php')) ) {
						// наполняем массив $valutes
						array_push($valutes, array(
							'country'	=> $country, // Страна, по порядку начиная с 0, как идут страны в списке include/countries.php
							'base_currency'	=> $value['baseCurrency'], // валюта, которую отдаем
							'target_currency'	=> $value['targetCurrency'], // валюта, которую получаем
							'nominal'	=> 1,	// номинал - всегда 1!
							'base_name' => $value['baseName'], // название валюты, которую отдаем (Eng)
							'target_name' => $value['targetName'], // название валюты, которую получаем (Eng)
							'exchange_rate' 	=> $value['exchangeRate'], // курс валюты (номинал 1)
							'inverse_rate' 	=> $value['inverseRate'], // "обратный" курс валюты (номинал 1)
						)
					);
				}
			}
		}

		// возвращаем массив курсов валюты
		return $valutes;
    }
}
