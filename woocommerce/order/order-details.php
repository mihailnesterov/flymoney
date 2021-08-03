<?php
/**
 * Order details
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/order/order-details.php.
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see     https://docs.woocommerce.com/document/template-structure/
 * @package WooCommerce\Templates
 * @version 4.6.0
 */

// Михаил 22-06-2021 - шаблон изменен

defined( 'ABSPATH' ) || exit;

$order = wc_get_order( $order_id ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

if ( ! $order ) {
	return;
}

$order_items           = $order->get_items( apply_filters( 'woocommerce_purchase_order_item_types', 'line_item' ) );
$show_purchase_note    = $order->has_status( apply_filters( 'woocommerce_purchase_note_order_statuses', array( 'completed', 'processing' ) ) );
$show_customer_details = is_user_logged_in() && $order->get_user_id() === get_current_user_id();
$downloads             = $order->get_downloadable_items();
$show_downloads        = $order->has_downloadable_item() && $order->is_download_permitted();

if ( $show_downloads ) {
	wc_get_template(
		'order/order-downloads.php',
		array(
			'downloads'  => $downloads,
			'show_title' => true,
		)
	);
}

$payment_gateway = wc_get_payment_gateway_by_order( $order ); 
?>
<section class="woocommerce-order-details">
	<?php do_action( 'woocommerce_order_details_before_order_table', $order ); ?>

	<h2 class="woocommerce-order-details__title"><?php esc_html_e( 'Order details', 'woocommerce' ); ?></h2>
	
	<div style="border:1px #f0f0f0 solid;background-color:#fff;padding:1em;margin:1em 0;">
		
		<div style="display:flex; align-items:start; justify-content:space-between;padding:0.5em;background-color:#F3F8FB;">
			<div style="flex:1;padding:0.25em;"><p>Заявка №</p></div>
			<div style="flex:1;padding:0.25em;"><p><b><?= $order->get_order_number() ?></b></p></div>
		</div>
		
		<div style="display:flex; align-items:start; justify-content:space-between;padding:0.5em;">
			<div style="flex:1;padding:0.25em;"><p>Дата оформления</p></div>
			<div style="flex:1;padding:0.25em;"><p><b><?= wc_format_datetime( $order->get_date_created() )?></b></p></div>
		</div>
		
		<div style="display:flex; align-items:start; justify-content:space-between;padding:0.5em;background-color:#F3F8FB;">
			<?php
			
				$is_order_paid = 0;
				$order_status = '';
				
				switch ($order->get_status()) {
					case 'pending':
				        $order_status = '<b style="color:#FF4040">В ожидании оплаты</b>';
				        $is_order_paid = 0;
				        break;
				    case 'on-hold':
				        $order_status = '<b style="color:#FF4040">В ожидании оплаты</b>';
				        $is_order_paid = 0;
				        break;
				    case 'processing':
				        $order_status = '<b style="color:#269926">Оплачена клиентом, оператор работает над переводом</b>';
				        $is_order_paid = 0;
				        break;
				    case 'completed':
				        $order_status = '<b style="color:#269926">Заявка выполнена</b>';
				        $is_order_paid = 1;
				        break;
				    case 'refunded':
				        $order_status = '<b style="color:#FF4040">Ошибка в заявке, свяжитесь с тех. поддержкой.</b>';
				        $is_order_paid = 1;
				        break;                    
				    case 'cancelled':
				        $order_status = '<b style="color:#FF4040">Заявка отменена</b>';
				        $is_order_paid = 1;
				        break;
				    case 'failed':
				        $order_status = '<b style="color:#FF4040">Заявка не удалась</b>';
				        $is_order_paid = 0;
				        break;                    
				    default:
				        $order_status = '<b style="color:#FF4040">В ожидании оплаты</b>';
				        $is_order_paid = 0;
				}
			?>
			<div style="flex:1;padding:0.25em;"><p>Статус заявки</p></div>
			<div style="flex:1;padding:0.25em;">
				<p>
					<?= $order_status ?>
				</p>
			</div>
			
			<?php $client_status = get_post_meta( $order_id, 'client_status', true ); ?>
			
			<?php if( $client_status !== 0 && $client_status !== ''): ?>
			<div style="display:flex; align-items:start; justify-content:space-between;padding:0.5em;">
				<div style="flex:1;padding:0.25em;"><p>Статус клиента</p></div>
				<div style="flex:1;padding:0.25em;"><p><b><?= $client_status ?></b></p></div>
			</div>
			<?php endif; ?>
		</div>
		
	</div>
	
	<div style="border:1px #f0f0f0 solid;background-color:#fff;padding:1em;">
		
		<div style="display:flex; align-items:start; justify-content: space-between;margin-bottom:0.5em;">
			<div style="flex:1;padding:0.5em;"><h5><b>Отдаете</b></h5></div>
			<div style="flex:1;padding:0.5em;"><h5><b>Получаете</b></h5></div>
		</div>
	
	<?php foreach( $order_items as $key => $item): 
		
		$order_id = $order->get_order_number(); ?>

		<div style="display:flex; align-items:start;justify-content:space-between;padding:0.5em;background-color:#F3F8FB;">
			<div style="flex:1;padding:0.25em;"><p><?= explode(' - ', $item->get_name())[0] ?></p></div>
			<div style="flex:1;padding:0.25em;"><p><?= explode(' - ', $item->get_name())[1] ?></p></div>
		</div>
	
	
		<div style="display:flex; align-items:start;justify-content:space-between;padding:0.5em;">
			<div style="flex:1;padding:0.25em;">
				<p>
					<b><?= round(floatval( preg_replace("/[^-0-9\.]/", ".", get_post_meta( $order_id, 'amount_send', true )) ), 2) ?></b> <?= get_post_meta( $order_id, 'send_currency', true ) ?> &nbsp;
					
					<?php $discount = get_post_meta( $order_id, 'discount', true ); ?>
					<?php if( $discount !== 0 && $discount !== ''): ?>
						<b>Скидка <?= round(floatval( preg_replace("/[^-0-9\.]/", ".", $discount) ), 2) ?></b> <?= get_post_meta( $order_id, 'send_currency', true ) ?>
					<?php endif; ?>
				</p>
			</div>
			<div style="flex:1;padding:0.25em;"><p><b><?= round(floatval( preg_replace("/[^-0-9\.]/", ".", get_post_meta( $order_id, 'amount_receive', true )) ), 2) ?></b> <?= get_post_meta( $order_id, 'receive_currency', true ) ?></p></div>
		</div>
		
		<div style="display:flex; align-items:start; justify-content:space-between;padding:0.5em;background-color:#F3F8FB;">
			<div style="flex:1;padding:0.25em;"><p><?= get_post_meta( $order_id, 'send_from', true ) ?></p></div>
			<div style="flex:1;padding:0.25em;"><p><?= get_post_meta( $order_id, 'receive_to', true ) ?></p></div>
		</div>
		
		<div style="display:flex; align-items:start; justify-content:space-between;padding:0.5em;">
			<div style="flex:1;padding:0.25em;"><p><b><?= $order->get_billing_first_name() ?></b></p></div>
			<div style="flex:1;padding:0.25em;"><p><b><?= get_post_meta( $order_id, 'receiver_fio', true ) ?></b></p></div>
		</div>
		
		<div style="display:flex; align-items:start; justify-content:space-between;padding:0.5em;background-color:#F3F8FB;">
			<div style="flex:1;padding:0.25em;"><p><?= $order->get_billing_phone() ?></p></div>
			<div style="flex:1;padding:0.25em;"><p><?= get_post_meta( $order_id, 'receiver_phone', true ) ?></p></div>
		</div>
		
	<?php endforeach; ?>
	</div>
	
	<?php if( $is_order_paid === 0 ): ?>
	<div style="border:1px #f0f0f0 solid;background-color:#fff;padding:1em;margin:1em 0;">
		
		<?php 

		$bank_send	= null;
		$account	= null;
		
		$bacs_accounts_info = get_option( 'woocommerce_bacs_accounts');
		
		foreach( $order_items as $item) {
			$bank_send = explode(' - ', $item->get_name())[0];
		}
		
		foreach( $bacs_accounts_info as $acc) {
			if( $acc["bank_name"]  === $bank_send ) {
				$account = $acc;
			}
		}
		?>
		
		<h5 style="padding:0.5em;"><b>Как оплатить</b></h5>
		
		<div style="display:flex; align-items:start; justify-content:space-between;padding:0.5em;background-color:#F3F8FB;">
			<div style="flex:1;padding:0.25em;">
				<p style="margin-bottom:0.75rem"><?= $payment_gateway->title ?>:</p>
				<?php if( isset($account) && !empty($account) ): ?>
					<p style="margin-bottom:0.75rem"><?= $account["account_name"] ?> <b><?= $account["account_number"] ?></b></p>
					<p><?= $account["sort_code"] ?></p>
				<?php endif; ?>
			</div>
			<div style="flex:1;padding:0.25em;"><p><?= $payment_gateway->description ?></p></div>
		</div>
	</div>
	<?php endif; ?>

	<?php do_action( 'woocommerce_order_details_after_order_table', $order ); ?>
</section>

<?php
/**
 * Action hook fired after the order details.
 *
 * @since 4.4.0
 * @param WC_Order $order Order data.
 */
do_action( 'woocommerce_after_order_details', $order );

